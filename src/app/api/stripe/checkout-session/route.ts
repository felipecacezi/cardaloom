
import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { ref, get, update } from 'firebase/database';
import { stripe } from '@/lib/stripe';
import { realtimeDb } from '@/lib/firebase';
import { auth } from 'firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const { priceId, cnpj } = await req.json();

        if (!priceId || !cnpj) {
            return NextResponse.json({ error: 'Price ID e CNPJ são obrigatórios' }, { status: 400 });
        }

        const userRef = ref(realtimeDb, `users/${cnpj}`);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }
        
        const userData = snapshot.val();
        let stripeCustomerId = userData.stripeCustomerId;

        // Create a new Stripe customer if one doesn't exist
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                name: userData.restaurantName,
                metadata: {
                    cnpj: cnpj,
                },
            });
            stripeCustomerId = customer.id;
            await update(userRef, { stripeCustomerId: stripeCustomerId });
        }
        
        const origin = headers().get('origin') || 'http://localhost:9002';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [ { price: priceId, quantity: 1 } ],
            mode: 'subscription',
            customer: stripeCustomerId,
            success_url: `${origin}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard/subscription?canceled=true`,
            metadata: { cnpj }
        });

        if (session.url) {
            return NextResponse.json({ url: session.url });
        } else {
             return NextResponse.json({ error: 'Não foi possível criar a sessão no Stripe' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Stripe session error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
