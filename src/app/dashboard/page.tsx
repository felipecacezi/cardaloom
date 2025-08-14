
'use client';

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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Home, Utensils, Settings, LogOut } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function DashboardPage() {
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
              <SidebarMenuButton href="/dashboard" isActive tooltip="Início">
                <Home />
                Início
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Meu Cardápio">
                <Utensils />
                Meu Cardápio
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Configurações">
                <Settings />
                Configurações
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/" tooltip="Sair">
                        <LogOut />
                        Sair
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <h1 className="flex-1 text-lg font-semibold md:text-2xl">Dashboard</h1>
        </header>
        <main className="flex-1 p-6">
          <div className="border-2 border-dashed border-muted rounded-lg h-full p-8 flex items-center justify-center">
            <div className='text-center'>
                 <h2 className="text-2xl font-bold mb-4">Bem-vindo ao seu Painel!</h2>
                <p className="text-muted-foreground">Aqui você poderá gerenciar seu cardápio, visualizar estatísticas e muito mais.</p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
