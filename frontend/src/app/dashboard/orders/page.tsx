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
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

const companyFormSchema = z.object({
  restaurantName: z.string().min(2, { message: 'O nome do restaurante é obrigatório.' }),
  cnpj: z.string().min(14, { message: 'Por favor, insira um CNPJ válido.' }),
});

const userFormSchema = z.object({
  ownerName: z.string().min(2, { message: 'Seu nome é obrigatório.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
});

const addressFormSchema = z.object({
    street: z.string().min(2, { message: 'O nome da rua é obrigatório.' }),
    number: z.string().min(1, { message: 'O número é obrigatório.' }),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, { message: 'O bairro é obrigatório.' }),
    city: z.string().min(2, { message: 'A cidade é obrigatória.' }),
    state: z.string().min(2, { message: 'O estado é obrigatório.' }),
    zipCode: z.string().min(8, { message: 'O CEP é obrigatório.' }),
});

const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

const operatingHoursSchema = z.object({
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    delivery: z.boolean().default(false),
    hours: z.object(
        Object.fromEntries(
            weekDays.map(day => [
                day,
                z.object({
                    isOpen: z.boolean().default(false),
                    openTime: z.string().optional(),
                    closeTime: z.string().optional(),
                })
            ])
        ) as Record<(typeof weekDays)[number], z.ZodObject<{ isOpen: z.ZodBoolean, openTime: z.ZodOptional<z.ZodString>, closeTime: z.ZodOptional<z.ZodString> }>>
    )
});

const ordersFormSchema = z.object({
  receiveOrdersByWhatsapp: z.boolean().default(false),
  whatsappOrderNumber: z.string().optional(),
});


export default function SettingsPage() {
    const { toast } = useToast();

    const companyForm = useForm<z.infer<typeof companyFormSchema>>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            restaurantName: 'Cantina da Mama',
            cnpj: '12.345.678/0001-99',
        },
    });

    const userForm = useForm<z.infer<typeof userFormSchema>>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            ownerName: 'Maria Silva',
            email: 'maria.silva@email.com',
        },
    });

    const addressForm = useForm<z.infer<typeof addressFormSchema>>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            street: 'Av. Brasil',
            number: '123',
            complement: 'Apto 101, Bloco B',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
        },
    });
    
    const operatingHoursForm = useForm<z.infer<typeof operatingHoursSchema>>({
        resolver: zodResolver(operatingHoursSchema),
        defaultValues: {
            phone: '(11) 98765-4321',
            whatsapp: '(11) 98765-4321',
            delivery: true,
            hours: {
                monday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
                tuesday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
                wednesday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
                thursday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
                friday: { isOpen: true, openTime: '18:00', closeTime: '00:00' },
                saturday: { isOpen: true, openTime: '12:00', closeTime: '00:00' },
                sunday: { isOpen: false, openTime: '', closeTime: '' },
            }
        }
    });

     const ordersForm = useForm<z.infer<typeof ordersFormSchema>>({
        resolver: zodResolver(ordersFormSchema),
        defaultValues: {
            receiveOrdersByWhatsapp: true,
            whatsappOrderNumber: '(11) 91234-5678',
        },
    });

    const dayLabels: Record<(typeof weekDays)[number], string> = {
        monday: 'Segunda-feira',
        tuesday: 'Terça-feira',
        wednesday: 'Quarta-feira',
        thursday: 'Quinta-feira',
        friday: 'Sexta-feira',
        saturday: 'Sábado',
        sunday: 'Domingo',
    };

    function onCompanySubmit(values: z.infer<typeof companyFormSchema>) {
        console.log('Company Data:', values);
        toast({
            title: "Dados da Empresa Atualizados!",
            description: "As informações da sua empresa foram salvas com sucesso.",
        });
    }

    function onUserSubmit(values: z.infer<typeof userFormSchema>) {
        console.log('User Data:', values);
        toast({
            title: "Dados do Usuário Atualizados!",
            description: "Suas informações de perfil foram salvas com sucesso.",
        });
    }

    function onAddressSubmit(values: z.infer<typeof addressFormSchema>) {
        console.log('Address Data:', values);
        toast({
            title: "Endereço Atualizado!",
            description: "O endereço do seu estabelecimento foi salvo com sucesso.",
        });
    }
    
    function onOperatingHoursSubmit(values: z.infer<typeof operatingHoursSchema>) {
        console.log('Operating Hours Data:', values);
        toast({
            title: "Informações de Funcionamento Atualizadas!",
            description: "Os horários e contatos foram salvos com sucesso.",
        });
    }

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
          <h1 className="text-lg font-semibold md:text-2xl">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie as informações da sua conta e do seu estabelecimento.</p>
        </div>
      </header>
      <main className="flex-1 p-6 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>Atualize o nome e o CNPJ do seu restaurante.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...companyForm}>
                    <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                         <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={companyForm.control}
                                name="restaurantName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Restaurante</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Ex: Cantina da Mama" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={companyForm.control}
                                name="cnpj"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CNPJ</FormLabel>
                                    <FormControl>
                                    <Input placeholder="00.000.000/0000-00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit">Salvar Alterações</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        <Separator />

        <Card>
            <CardHeader>
                <CardTitle>Dados do Usuário</CardTitle>
                <CardDescription>Gerencie suas informações pessoais de acesso.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                         <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={userForm.control}
                                name="ownerName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Seu Nome</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Ex: Maria Silva" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={userForm.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                    <Input type="email" placeholder="seu@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit">Salvar Alterações</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        <Separator />

         <Card>
            <CardHeader>
                <CardTitle>Endereço do Estabelecimento</CardTitle>
                <CardDescription>Mantenha o endereço do seu negócio sempre atualizado.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...addressForm}>
                    <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                            control={addressForm.control}
                            name="street"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                <FormLabel>Rua</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Av. Brasil" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={addressForm.control}
                            name="number"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Número</FormLabel>
                                <FormControl>
                                    <Input placeholder="123" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <FormField
                            control={addressForm.control}
                            name="complement"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Complemento</FormLabel>
                                <FormControl>
                                <Input placeholder="Apto 101, Bloco B" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                            control={addressForm.control}
                            name="neighborhood"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Bairro</FormLabel>
                                <FormControl>
                                    <Input placeholder="Centro" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={addressForm.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Cidade</FormLabel>
                                <FormControl>
                                    <Input placeholder="São Paulo" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                            control={addressForm.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <FormControl>
                                    <Input placeholder="SP" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={addressForm.control}
                            name="zipCode"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>CEP</FormLabel>
                                <FormControl>
                                    <Input placeholder="01234-567" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <Button type="submit">Salvar Endereço</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        <Separator />

        <Card>
            <CardHeader>
                <CardTitle>Funcionamento e Contato</CardTitle>
                <CardDescription>Informe seus horários, contatos e se você faz entregas.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...operatingHoursForm}>
                    <form onSubmit={operatingHoursForm.handleSubmit(onOperatingHoursSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            {weekDays.map((day) => {
                                const isOpen = operatingHoursForm.watch(`hours.${day}.isOpen`);
                                return (
                                <FormField
                                    key={day}
                                    control={operatingHoursForm.control}
                                    name={`hours.${day}.isOpen`}
                                    render={({ field }) => (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5 mb-4 sm:mb-0">
                                            <FormLabel className="text-base">{dayLabels[day]}</FormLabel>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    id={`is-open-${day}`}
                                                />
                                                <label
                                                    htmlFor={`is-open-${day}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Aberto
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <FormField
                                                control={operatingHoursForm.control}
                                                name={`hours.${day}.openTime`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="time" {...field} disabled={!isOpen} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <span>até</span>
                                            <FormField
                                                control={operatingHoursForm.control}
                                                name={`hours.${day}.closeTime`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                           <Input type="time" {...field} disabled={!isOpen} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    )}
                                />
                            )})}
                        </div>
                        <Separator />
                        <div className="grid md:grid-cols-2 gap-4">
                             <FormField
                                control={operatingHoursForm.control}
                                name="phone"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefone para Contato</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(99) 99999-9999" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={operatingHoursForm.control}
                                name="whatsapp"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(99) 99999-9999" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={operatingHoursForm.control}
                            name="delivery"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Faz entregas (Delivery)?
                                    </FormLabel>
                                    <FormDescription>
                                        Marque esta opção se você oferece serviço de entrega.
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
                        <Button type="submit">Salvar Horários e Contatos</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Separator />

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