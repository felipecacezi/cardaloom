
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
import { Home, Utensils, Settings, LogOut, Bookmark, PlusSquare, ShoppingCart } from 'lucide-react';
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
                 <Link href="/dashboard/orders">
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/orders'} tooltip="Pedidos">
                        <span>
                            <ShoppingCart />
                            Pedidos
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
                    <Link href="/">
                        <SidebarMenuButton asChild tooltip="Sair">
                            <span>
                                <LogOut />
                                Sair
                            </span>
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
