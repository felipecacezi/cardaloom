
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { ref, update } from 'firebase/database';
import { stripe } from '@/lib/stripe';
import { realtimeDb } from '@/lib/firebase';

async function updateSubscriptionInDb(subscription: Stripe.Subscription) {
    const cnpj = subscription.metadata.cnpj;
    if (!cnpj) {
        console.error("Webhook Error: CNPJ not found in subscription metadata.");
        return;
    }

    const userRef = ref(realtimeDb, `users/${cnpj}`);
    const subscriptionData = {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: subscription.current_period_end,
        stripeSubscriptionStatus: subscription.status,
    };
    await update(userRef, subscriptionData);
    console.log(`Updated subscription for CNPJ: ${cnpj}`);
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
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await updateSubscriptionInDb(subscription);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'customer.subscription.resumed':
    case 'customer.subscription.paused': {
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscriptionInDb(subscription);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
