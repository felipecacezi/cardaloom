
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { ref, update, get, set } from 'firebase/database';
import { stripe } from '@/lib/stripe';
import { realtimeDb } from '@/lib/firebase';

// Helper function to find user by stripeCustomerId
async function findUserByStripeCustomerId(customerId: string): Promise<string | null> {
    const usersRef = ref(realtimeDb, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
        const usersData = snapshot.val();
        for (const cnpj in usersData) {
            if (usersData[cnpj].stripeCustomerId === customerId) {
                return cnpj;
            }
        }
    }
    return null;
}


async function updateSubscriptionInDb(subscription: Stripe.Subscription) {
    let cnpj = subscription.metadata.cnpj;
    
    if (!cnpj && subscription.customer) {
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        cnpj = await findUserByStripeCustomerId(customerId);
    }

    if (!cnpj) {
        console.error("Webhook Error: CNPJ not found in subscription metadata or by customer ID.", { subscriptionId: subscription.id, customerId: subscription.customer });
        return;
    }

    const userRef = ref(realtimeDb, `users/${cnpj}`);
    const subscriptionRef = ref(realtimeDb, `users/${cnpj}/subscription`);

    const subscriptionData: any = {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: subscription.current_period_end,
        stripeSubscriptionStatus: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
    };
    
    // For checkout complete, also update the customer ID on the user record using CNPJ from metadata
    if (event.type === 'checkout.session.completed') {
        await update(userRef, { 
            stripeCustomerId: subscription.customer,
            subscription: subscriptionData
         });
    } else {
        await set(subscriptionRef, subscriptionData);
    }

    console.log(`Updated subscription for CNPJ: ${cnpj}`);
}

let event: Stripe.Event;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;


  if (!webhookSecret) {
    console.error('Stripe webhook secret is not set.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
  
  const session = event.data.object as any;

  try {
    switch (event.type) {
        case 'checkout.session.completed': {
        const completedSession = session as Stripe.Checkout.Session;
        if (completedSession.mode === 'subscription' && completedSession.subscription) {
            const subscriptionId = typeof completedSession.subscription === 'string' 
                ? completedSession.subscription 
                : completedSession.subscription.id;
            
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            subscription.metadata = { ...subscription.metadata, cnpj: completedSession.metadata?.cnpj };

            await updateSubscriptionInDb(subscription);
        }
        break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.created': {
        const subscription = session as Stripe.Subscription;
        await updateSubscriptionInDb(subscription);
        break;
        }
        default:
    }
    return NextResponse.json({ received: true });
  } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json({ error: "Internal server error during webhook processing." }, { status: 500 });
  }
}
