
'use client';

import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStripe } from '@/lib/stripe-client';

export default function SubscriptionPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();

  const currentPlan = {
    name: 'Plano Pro',
    price: 'R$ 49,90/mês',
    renewsOn: '25 de Agosto de 2024',
    features: [
      'Cardápio digital ilimitado',
      'Pedidos via WhatsApp',
      'Suporte prioritário',
      'Domínio personalizado (em breve)',
      'Estatísticas avançadas (em breve)',
    ],
  };

  const paymentMethod = {
    brand: 'Visa',
    last4: '4242',
    expires: '12/2028',
  };

  const handleUpgradeClick = async () => {
    setIsRedirecting(true);
    try {
        // This is a placeholder for getting the user's CNPJ.
        // In a real app, you would get this from the authenticated user's session.
        const cnpj = '00000000000191'; 

        const res = await fetch('/api/stripe/checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
                cnpj: cnpj 
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const { url } = await res.json();
        if (url) {
            window.location.href = url;
        } else {
            throw new Error('Could not get redirect URL');
        }

    } catch (error: any) {
        toast({
            title: 'Erro',
            description: error.message || 'Não foi possível redirecionar para o pagamento. Tente novamente.',
            variant: 'destructive',
        });
        setIsRedirecting(false);
    }
  };


  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Gerenciar Assinatura</h1>
          <p className="text-sm text-muted-foreground">Veja os detalhes do seu plano e gerencie suas faturas.</p>
        </div>
      </header>
      <main className="flex-1 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Seu Plano Atual</CardTitle>
                    <CardDescription>Próxima renovação em {currentPlan.renewsOn}.</CardDescription>
                  </div>
                   <Badge variant="secondary" className="text-base">{currentPlan.name}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-3xl font-bold">{currentPlan.price}</p>
                <ul className="space-y-2 text-muted-foreground">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Histórico de Faturamento</CardTitle>
                <CardDescription>Visualize e baixe suas faturas anteriores.</CardDescription>
            </CardHeader>
             <CardContent>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-muted-foreground">
                            <th className="pb-2 font-normal">Data</th>
                            <th className="pb-2 font-normal">Valor</th>
                            <th className="pb-2 font-normal text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2">25 de Julho de 2024</td>
                            <td className="py-2">R$ 49,90</td>
                            <td className="py-2 text-right">
                                <Button variant="outline" size="sm">Download</Button>
                            </td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2">25 de Junho de 2024</td>
                            <td className="py-2">R$ 49,90</td>
                            <td className="py-2 text-right">
                                <Button variant="outline" size="sm">Download</Button>
                            </td>
                        </tr>
                         <tr className="border-b">
                            <td className="py-2">25 de Maio de 2024</td>
                            <td className="py-2">R$ 49,90</td>
                            <td className="py-2 text-right">
                                <Button variant="outline" size="sm">Download</Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-10 h-7 bg-muted rounded-md flex items-center justify-center font-bold text-xs">
                           {paymentMethod.brand}
                        </div>
                        <div>
                            <p className="font-medium">Final •••• {paymentMethod.last4}</p>
                            <p className="text-sm text-muted-foreground">Expira em {paymentMethod.expires}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Opções da Assinatura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full justify-between" onClick={handleUpgradeClick} disabled={isRedirecting}>
                        {isRedirecting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Redirecionando...
                            </>
                        ) : (
                            <>
                                <span>Alterar Plano</span>
                                <ArrowRight />
                            </>
                        )}
                    </Button>
                     <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:border-red-500">
                        Cancelar Assinatura
                    </Button>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
