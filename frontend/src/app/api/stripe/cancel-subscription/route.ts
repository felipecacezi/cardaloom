
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
        const subscriptionId = userData.subscription?.stripeSubscriptionId;

        if (!subscriptionId) {
            return NextResponse.json({ error: 'ID de assinatura não encontrado para este usuário' }, { status: 400 });
        }

        // Cancela a assinatura ao final do período de cobrança
        // O webhook 'customer.subscription.updated' irá capturar a mudança de status
        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        return NextResponse.json({ message: 'Cancelamento da assinatura agendado com sucesso. Você terá acesso até o final do período de cobrança atual.' });

    } catch (error: any) {
        console.error('Erro ao cancelar assinatura no Stripe:', error);
        return NextResponse.json({ error: 'Erro ao processar o cancelamento da assinatura', details: error.message }, { status: 500 });
    }
}
