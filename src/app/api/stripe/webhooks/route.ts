
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { ref, update, get } from 'firebase/database';
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
    
    // Fallback for events where metadata might not be present (e.g., updates from the dashboard)
    if (!cnpj && subscription.customer) {
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        cnpj = await findUserByStripeCustomerId(customerId);
    }

    if (!cnpj) {
        console.error("Webhook Error: CNPJ not found in subscription metadata or by customer ID.", { subscriptionId: subscription.id, customerId: subscription.customer });
        // We shouldn't return here, because we might need to create the customer link later
    }

    const subscriptionData: any = {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: subscription.current_period_end,
        stripeSubscriptionStatus: subscription.status,
    };
    
    // For checkout complete, also update the customer ID on the user record using CNPJ from metadata
    if (subscription.metadata.cnpj) {
        const userRef = ref(realtimeDb, `users/${subscription.metadata.cnpj}`);
         await update(userRef, {
             ...subscriptionData,
             stripeCustomerId: subscription.customer // Ensure customer ID is stored
         });
        console.log(`Updated subscription for CNPJ: ${subscription.metadata.cnpj}`);
    } else if (cnpj) {
        const userRef = ref(realtimeDb, `users/${cnpj}`);
        await update(userRef, subscriptionData);
        console.log(`Updated subscription for user with Stripe Customer ID: ${subscription.customer}`);
    } else {
        console.error("Webhook Error: Could not update subscription, no user identifier found.");
    }
}


export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

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
            
            // Retrieve the full subscription object to get all details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            // Add metadata from session to the subscription object for easier linking
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
        // console.log(`Unhandled event type ${event.type}`); // Temporarily disable for cleaner logs
    }
    return NextResponse.json({ received: true });
  } catch (error) => {
      console.error("Error processing webhook:", error);
      return NextResponse.json({ error: "Internal server error during webhook processing." }, { status: 500 });
  }
}
