
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, AlertTriangle } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function TrialExpiredNotice() {
  return (
    <Card className="mb-6 bg-amber-50 border-amber-300">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <div>
          <CardTitle>Seu período de teste terminou</CardTitle>
          <CardDescription>
            Para continuar gerenciando seus produtos, categorias e outras funcionalidades, por favor, assine um de nossos planos.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/dashboard/subscription">Ver Planos e Assinar</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [showTrialNotice, setShowTrialNotice] = useState(false);

  useEffect(() => {
    if (searchParams.get('trial') === 'expired') {
      setShowTrialNotice(true);
    } else {
      setShowTrialNotice(false);
    }
  }, [searchParams]);

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        </div>
        <Button asChild>
            <Link href="/menu" target="_blank">
                <Eye className="mr-2" />
                Ver Cardápio
            </Link>
        </Button>
      </header>
      <main className="flex-1 p-6">
        {showTrialNotice && <TrialExpiredNotice />}
        <div className="border-2 border-dashed border-muted rounded-lg h-full p-8 flex items-center justify-center">
          <div className='text-center'>
               <h2 className="text-2xl font-bold mb-4">Bem-vindo ao seu Painel!</h2>
          </div>
        </div>
      </main>
    </>
  );
}
