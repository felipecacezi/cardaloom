
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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Home, Utensils, Settings, LogOut, Bookmark } from 'lucide-react';
import { Logo } from '@/components/logo';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
                <Link href="/dashboard" passHref legacyBehavior>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Início">
                        <Home />
                        Início
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="#" passHref legacyBehavior>
                    <SidebarMenuButton asChild tooltip="Meu Cardápio">
                        <Utensils />
                        Meu Cardápio
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <Link href="/dashboard/categories" passHref legacyBehavior>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/categories'} tooltip="Categorias">
                        <Bookmark />
                        Categorias
                    </SidebarMenuButton>
                 </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="#" passHref legacyBehavior>
                    <SidebarMenuButton asChild tooltip="Configurações">
                        <Settings />
                        Configurações
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/" passHref legacyBehavior>
                        <SidebarMenuButton asChild tooltip="Sair">
                            <LogOut />
                            Sair
                        </SidebarMenuButton>
                    </Link>
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
