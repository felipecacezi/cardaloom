
import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { ref, get } from 'firebase/database';
import { stripe } from '@/lib/stripe';
import { realtimeDb } from '@/lib/firebase';

export async function POST(req: NextRequest) {
    try {
        const { cnpj } = await req.json();

        if (!cnpj) {
            return NextResponse.json({ error: 'CNPJ é obrigatório' }, { status: 400 });
        }

        const userRef = ref(realtimeDb, `users/${cnpj}`);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }
        
        const userData = snapshot.val();
        const stripeCustomerId = userData.stripeCustomerId;

        if (!stripeCustomerId) {
            return NextResponse.json({ error: 'Cliente Stripe não encontrado para este usuário' }, { status: 400 });
        }
        
        const origin = headers().get('origin') || 'http://localhost:9002';

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${origin}/dashboard/subscription`,
        });

        if (portalSession.url) {
            return NextResponse.json({ url: portalSession.url });
        } else {
             return NextResponse.json({ error: 'Não foi possível criar a sessão do portal do cliente' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Stripe portal session error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
