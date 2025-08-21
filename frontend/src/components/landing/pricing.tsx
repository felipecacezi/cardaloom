'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

const proPlan = {
    name: 'Plano Pro',
    price: 'R$ 49,90',
    period: '/mês',
    description: 'Ideal para negócios que querem crescer e ter acesso a todas as funcionalidades.',
    features: [
      'Cardápio digital ilimitado',
      'Pedidos via WhatsApp',
      'Suporte prioritário',
      'Personalização avançada',
      'Domínio personalizado (em breve)',
      'Estatísticas avançadas (em breve)',
    ],
    cta: 'Começar com o Plano Pro',
};

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-32">
      <div className="container px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Um plano simples e transparente
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Escolha o plano que se encaixa perfeitamente no seu negócio. Sem taxas escondidas.
        </p>

        <div className="flex justify-center mt-12">
            <Card className="max-w-md w-full border-primary border-2 shadow-lg text-left">
                <CardHeader>
                    <div className="flex justify-between items-center">
                       <CardTitle className="text-2xl">{proPlan.name}</CardTitle>
                       <Star className="h-6 w-6 text-yellow-500 fill-current"/>
                    </div>
                    <CardDescription>{proPlan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <span className="text-4xl font-bold">{proPlan.price}</span>
                        <span className="text-muted-foreground">{proPlan.period}</span>
                    </div>
                     <ul className="space-y-3">
                       {proPlan.features.map((feature, index) => (
                           <li key={index} className="flex items-center gap-2">
                               <CheckCircle className="h-5 w-5 text-green-500" />
                               <span>{feature}</span>
                           </li>
                       ))}
                   </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild size="lg" className="w-full">
                        <Link href="/signup">{proPlan.cta}</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </section>
  );
}
