
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Utensils, Settings, LogOut, Bookmark, PlusSquare, CreditCard, Loader2 } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ref, get } from 'firebase/database';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SheetTitle,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { auth, realtimeDb } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';


function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Você saiu!',
        description: 'Você foi desconectado com sucesso.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Erro ao sair',
        description: 'Não foi possível fazer logout. Tente novamente.',
        variant: 'destructive',
      });
    }
  };


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <div className="p-2">
            <Logo />
           </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/dashboard">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Início">
                        <span>
                            <Home />
                            Início
                        </span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/dashboard/products">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/products'} tooltip="Produtos">
                        <span>
                            <Utensils />
                            Produtos
                        </span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <Link href="/dashboard/categories">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/categories'} tooltip="Categorias">
                        <span>
                            <Bookmark />
                            Categorias
                        </span>
                    </SidebarMenuButton>
                 </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <Link href="/dashboard/addons">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/addons'} tooltip="Adicionais">
                        <span>
                            <PlusSquare />
                            Adicionais
                        </span>
                    </SidebarMenuButton>
                 </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/dashboard/subscription">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/subscription'} tooltip="Assinatura">
                        <span>
                            <CreditCard />
                            Assinatura
                        </span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/dashboard/settings">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/settings'} tooltip="Configurações">
                        <span>
                            <Settings />
                            Configurações
                        </span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleSignOut} asChild tooltip="Sair">
                        <span>
                            <LogOut />
                            Sair
                        </span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

const syncUserSubscription = async (user: User) => {
    try {
        const usersRef = ref(realtimeDb, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const usersData = snapshot.val();
            const userEntry = Object.entries(usersData).find(
                ([, data]) => (data as any).authUid === user.uid
            );

            if (userEntry) {
                const cnpj = userEntry[0];
                await fetch('/api/stripe/sync-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, cnpj: cnpj }),
                });
            }
        }
    } catch (error) {
        console.error("Failed to sync subscription on login:", error);
    }
};


const withAuth = (Component: React.ComponentType<any>) => {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push('/login');
        } else {
          // Sincroniza a assinatura ao carregar o usuário
          syncUserSubscription(user).finally(() => {
              setLoading(false);
          });
        }
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    return <Component {...props} />;
  };
};

export default withAuth(DashboardLayoutContent);
