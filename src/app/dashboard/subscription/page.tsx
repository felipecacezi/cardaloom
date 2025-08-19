
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, get, onValue } from 'firebase/database';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ArrowRight, Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, realtimeDb } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type SubscriptionData = {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: number;
  stripeSubscriptionStatus?: string;
};

const proPlan = {
    name: 'Plano Pro',
    price: 'R$ 49,90/mês',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      'Cardápio digital ilimitado',
      'Pedidos via WhatsApp',
      'Suporte prioritário',
      'Domínio personalizado (em breve)',
      'Estatísticas avançadas (em breve)',
    ],
};

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCnpj, setUserCnpj] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('success')) {
      toast({
        title: 'Assinatura Ativada!',
        description: 'Seu plano foi ativado com sucesso. Bem-vindo ao Pro!',
      });
    }
    if (searchParams.get('canceled')) {
      toast({
        title: 'Operação Cancelada',
        description: 'Você cancelou o processo de assinatura.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
            const usersRef = ref(realtimeDb, 'users');
            const snapshot = await get(usersRef);
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const userEntry = Object.entries(usersData).find(
                    ([, data]) => (data as any).authUid === user.uid
                );
                if (userEntry) {
                    setUserCnpj(userEntry[0]);
                } else {
                    toast({ title: "Erro", description: "Dados do restaurante não encontrados.", variant: "destructive" });
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            toast({ title: "Erro de Conexão", description: "Não foi possível buscar os dados.", variant: "destructive" });
            setIsLoading(false);
        }
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, [toast]);

  useEffect(() => {
    if (!userCnpj) return;

    const subscriptionRef = ref(realtimeDb, `users/${userCnpj}/subscription`);
    const unsubscribeDb = onValue(subscriptionRef, (snapshot) => {
      const subscriptionData = snapshot.val();
      console.log("Dados da assinatura no Firebase:", subscriptionData);
      setSubscription(subscriptionData);
      setIsLoading(false);
    }, (error) => {
        console.error("Firebase onValue error:", error);
        toast({ title: "Erro", description: "Não foi possível carregar os dados da assinatura.", variant: "destructive" });
        setIsLoading(false);
    });

    return () => unsubscribeDb();
  }, [userCnpj, toast]);

  const handleSubscriptionAction = async () => {
    if (!userCnpj) {
        toast({ title: 'Erro', description: 'Informações do usuário inválidas.', variant: 'destructive'});
        return;
    }
    setIsRedirecting(true);
    try {
        const isSubscribed = subscription?.stripeSubscriptionId && subscription?.stripeSubscriptionStatus === 'active';
        const endpoint = isSubscribed ? '/api/stripe/customer-portal' : '/api/stripe/checkout-session';

        const body = isSubscribed ? { cnpj: userCnpj } : { priceId: proPlan.priceId, cnpj: userCnpj };

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Falha ao processar a solicitação.');
        }

        const { url } = await res.json();
        if (url) {
            window.location.href = url;
        } else {
            throw new Error('Não foi possível obter a URL de redirecionamento.');
        }
    } catch (error: any) {
        toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive',
        });
        setIsRedirecting(false);
    }
  };

  const renderCurrentPlan = () => {
    // If user has an active subscription, show the management card.
    if (subscription?.stripeSubscriptionStatus === 'active') {
        const renewalDate = subscription.stripeCurrentPeriodEnd 
          ? new Date(subscription.stripeCurrentPeriodEnd * 1000).toLocaleDateString('pt-BR')
          : 'N/A';
          
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Seu Plano Atual</CardTitle>
                    <CardDescription>Próxima renovação em {renewalDate}.</CardDescription>
                  </div>
                   <Badge variant="secondary" className="text-base bg-green-100 text-green-800 border-green-300">
                    <Star className="mr-2 h-4 w-4 text-yellow-500 fill-current" />
                    {proPlan.name}
                   </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-3xl font-bold">{proPlan.price}</p>
                <ul className="space-y-2 text-muted-foreground">
                  {proPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                 <Separator className="my-4" />
                <Button className="w-full justify-between" onClick={handleSubscriptionAction} disabled={isRedirecting}>
                    {isRedirecting ? (
                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecionando... </>
                    ) : (
                        <> <span>Gerenciar Assinatura</span> <ArrowRight /> </>
                    )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
    
    // If not active, show the upgrade card.
    return (
       <Card className="border-primary border-2 shadow-lg">
           <CardHeader>
               <div className="flex justify-between items-center">
                   <CardTitle className="text-2xl">{proPlan.name}</CardTitle>
                   <Star className="h-6 w-6 text-yellow-500 fill-current"/>
               </div>
               <CardDescription>Acesso total a todos os recursos da plataforma.</CardDescription>
           </CardHeader>
           <CardContent>
               <p className="text-4xl font-bold mb-4">{proPlan.price}</p>
               <ul className="space-y-2 text-muted-foreground mb-6">
                   {proPlan.features.map((feature, index) => (
                       <li key={index} className="flex items-center gap-2">
                           <CheckCircle className="h-5 w-5 text-primary" />
                           <span>{feature}</span>
                       </li>
                   ))}
               </ul>
               <Button size="lg" className="w-full" onClick={handleSubscriptionAction} disabled={isRedirecting || !proPlan.priceId}>
                   {isRedirecting ? (
                       <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecionando... </>
                   ) : (
                      !proPlan.priceId ? 'Configuração de Plano Pendente' : 'Fazer Upgrade para o Pro'
                   )}
               </Button>
                {!proPlan.priceId && <p className="text-xs text-center text-destructive mt-2">O ID do plano não está configurado.</p>}
           </CardContent>
       </Card>
    );
  }

  const renderSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/4" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Gerenciar Assinatura</h1>
          <p className="text-sm text-muted-foreground">Veja os detalhes do seu plano e gerencie suas faturas.</p>
        </div>
      </header>
      <main className="flex-1 p-6">
        {isLoading ? renderSkeleton() : renderCurrentPlan()}
      </main>
    </>
  );
}
