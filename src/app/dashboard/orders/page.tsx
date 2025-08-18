
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

const ordersFormSchema = z.object({
  receiveOrdersByWhatsapp: z.boolean().default(false),
  whatsappOrderNumber: z.string().optional(),
});


export default function OrdersPage() {
    const { toast } = useToast();

    const ordersForm = useForm<z.infer<typeof ordersFormSchema>>({
        resolver: zodResolver(ordersFormSchema),
        defaultValues: {
            receiveOrdersByWhatsapp: true,
            whatsappOrderNumber: '(11) 91234-5678',
        },
    });
    
    function onOrdersSubmit(values: z.infer<typeof ordersFormSchema>) {
        console.log('Orders Data:', values);
        toast({
            title: "Configurações de Pedidos Atualizadas!",
            description: "As informações de pedidos foram salvas com sucesso.",
        });
    }

    return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Pedidos</h1>
          <p className="text-sm text-muted-foreground">Gerencie como você recebe os pedidos dos seus clientes.</p>
        </div>
      </header>
      <main className="flex-1 p-6 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Pedidos pelo WhatsApp</CardTitle>
                <CardDescription>
                    Permita que seus clientes enviem pedidos diretamente para o seu WhatsApp.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...ordersForm}>
                    <form onSubmit={ordersForm.handleSubmit(onOrdersSubmit)} className="space-y-6">
                       <FormField
                            control={ordersForm.control}
                            name="receiveOrdersByWhatsapp"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Ativar pedidos pelo WhatsApp?
                                    </FormLabel>
                                    <FormDescription>
                                        Ao ativar, um botão aparecerá no seu cardápio para os clientes enviarem o pedido.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        {ordersForm.watch('receiveOrdersByWhatsapp') && (
                            <FormField
                                control={ordersForm.control}
                                name="whatsappOrderNumber"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número para Pedidos</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(99) 99999-9999" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Este número será usado exclusivamente para receber os pedidos.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
                        <Button type="submit">Salvar Configurações de Pedidos</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </main>
    </>
    );
}
