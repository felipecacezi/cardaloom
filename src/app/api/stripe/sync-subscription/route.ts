
import { NextResponse, NextRequest } from 'next/server';
import { ref, update, get } from 'firebase/database';
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
            // Se não encontrar o cliente, não há o que sincronizar.
            // Poderíamos opcionalmente limpar os dados de assinatura no Firebase aqui.
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

        if (subscriptions.data.length > 0) {
            // 3. Se encontrar assinatura ativa, atualiza o Firebase
            const subscription = subscriptions.data[0];
            const subscriptionData = {
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0]?.price.id,
                stripeCurrentPeriodEnd: subscription.current_period_end,
                stripeSubscriptionStatus: subscription.status,
            };

            await update(userRef, subscriptionData);
            
            return NextResponse.json({ success: true, message: 'Assinatura sincronizada com sucesso.' });
        } else {
            // 4. Se não encontrar assinatura ativa, opcionalmente limpa os dados no Firebase
            // Isso previne que um usuário que cancelou a assinatura continue com status 'active' no nosso DB.
             const currentData = await get(userRef);
             if (currentData.exists() && currentData.val().stripeSubscriptionStatus === 'active') {
                 await update(userRef, {
                    stripeSubscriptionStatus: 'canceled', // ou o status final da assinatura
                 });
             }
            return NextResponse.json({ success: true, message: 'Nenhuma assinatura ativa encontrada.' });
        }

    } catch (error: any) {
        console.error('Erro ao sincronizar assinatura:', error);
        return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
    }
}
