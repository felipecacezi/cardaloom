
import { NextResponse, NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth, realtimeDb } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { priceId, cnpj } = await req.json();

        if (!priceId || !cnpj) {
            return NextResponse.json({ error: 'Price ID and CNPJ are required' }, { status: 400 });
        }

        const userRef = ref(realtimeDb, `users/${cnpj}`);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = snapshot.val();
        let stripeCustomerId = userData.stripeCustomerId;

        // Create a new Stripe customer if one doesn't exist
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: userData.email, // Assuming email is stored in user data
                name: userData.restaurantName,
                metadata: {
                    cnpj: cnpj,
                },
            });
            stripeCustomerId = customer.id;
            // You should update the user record in Firebase with this new customer ID
            // await update(userRef, { stripeCustomerId: stripeCustomerId });
        }
        
        const origin = headers().get('origin') || 'http://localhost:9002';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer: stripeCustomerId,
            success_url: `${origin}/dashboard/subscription?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard/subscription`,
            metadata: {
                cnpj: cnpj,
            }
        });

        if (session.url) {
            return NextResponse.json({ url: session.url });
        } else {
             return NextResponse.json({ error: 'Could not create Stripe session' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Stripe session error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
