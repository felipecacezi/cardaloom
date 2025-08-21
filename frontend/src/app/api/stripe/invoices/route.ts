
import { NextResponse, NextRequest } from 'next/server';
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
            return NextResponse.json({ invoices: [] });
        }

        const invoices = await stripe.invoices.list({
            customer: stripeCustomerId,
            limit: 20, // Limita às 20 faturas mais recentes
        });

        return NextResponse.json({ invoices: invoices.data });

    } catch (error: any) {
        console.error('Stripe invoices error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
