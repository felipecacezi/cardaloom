
import { NextResponse, NextRequest } from 'next/server';
import { ref, update, get, set } from 'firebase/database';
import { stripe } from '@/lib/stripe';
import { realtimeDb } from '@/lib/firebase';

export async function POST(req: NextRequest) {
    try {
        const { email, cnpj } = await req.json();

        if (!email || !cnpj) {
            return NextResponse.json({ error: 'Email e CNPJ são obrigatórios' }, { status: 400 });
        }

        // 1. Encontrar o cliente no Stripe pelo email
        const customers = await stripe.customers.list({ email: email, limit: 1 });

        if (customers.data.length === 0) {
            return NextResponse.json({ message: 'Cliente não encontrado no Stripe.' });
        }

        const customer = customers.data[0];

        // 2. Buscar assinaturas ativas para o cliente
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 1,
        });

        const userRef = ref(realtimeDb, `users/${cnpj}`);
        const subscriptionRef = ref(realtimeDb, `users/${cnpj}/subscription`);

        if (subscriptions.data.length > 0) {
            // 3. Se encontrar assinatura ativa, atualiza o Firebase sob a chave 'subscription'
            const subscription = subscriptions.data[0];
            const subscriptionData = {
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0]?.price.id,
                stripeCurrentPeriodEnd: subscription.current_period_end,
                stripeSubscriptionStatus: subscription.status,
            };

            await set(subscriptionRef, subscriptionData);
             // Opcional: Garante que o customerId também está no nível raiz do usuário
            await update(userRef, { stripeCustomerId: customer.id });
            
            return NextResponse.json({ success: true, message: 'Assinatura sincronizada com sucesso.', subscription: subscriptionData });
        } else {
            // 4. Se não encontrar assinatura ativa, define o status como inativo no Firebase
             await set(subscriptionRef, { stripeSubscriptionStatus: 'inactive' });
            return NextResponse.json({ success: true, message: 'Nenhuma assinatura ativa encontrada.' });
        }

    } catch (error: any) {
        console.error('Erro ao sincronizar assinatura:', error);
        return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
    }
}

