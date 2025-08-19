
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { auth, realtimeDb } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

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
  delivery: z.boolean().default(false),
  receiveOrdersByWhatsapp: z.boolean().default(false),
  whatsappOrderNumber: z.string().optional(),
});

type UserData = z.infer<typeof companyFormSchema> & 
                z.infer<typeof userFormSchema> & 
                { address: z.infer<typeof addressFormSchema> } &
                z.infer<typeof operatingHoursSchema> &
                z.infer<typeof ordersFormSchema>;


export default function SettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userCnpj, setUserCnpj] = useState<string | null>(null);

    const formOptions = {
        shouldUnregister: false // Keep form values even if fields are conditionally rendered
    };

    const companyForm = useForm<z.infer<typeof companyFormSchema>>({ resolver: zodResolver(companyFormSchema), ...formOptions });
    const userForm = useForm<z.infer<typeof userFormSchema>>({ resolver: zodResolver(userFormSchema), ...formOptions });
    const addressForm = useForm<z.infer<typeof addressFormSchema>>({ resolver: zodResolver(addressFormSchema), ...formOptions });
    const operatingHoursForm = useForm<z.infer<typeof operatingHoursSchema>>({ resolver: zodResolver(operatingHoursSchema), ...formOptions });
    const ordersForm = useForm<z.infer<typeof ordersFormSchema>>({ resolver: zodResolver(ordersFormSchema), ...formOptions });
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (currentUser) {
            const usersRef = ref(realtimeDb, 'users');
            get(usersRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const usersData = snapshot.val();
                    const userEntry = Object.entries(usersData).find(
                        ([, data]) => (data as any).authUid === currentUser.uid
                    );
                    if (userEntry) {
                        const cnpj = userEntry[0];
                        const userData = userEntry[1] as UserData;
                        setUserCnpj(cnpj);

                        // Populate forms with existing data
                        companyForm.reset({ restaurantName: userData.restaurantName, cnpj: userData.cnpj });
                        userForm.reset({ ownerName: userData.ownerName, email: currentUser.email || '' });
                        addressForm.reset(userData.address || {});
                        operatingHoursForm.reset({
                            phone: userData.phone || '',
                            whatsapp: userData.whatsapp || '',
                            hours: userData.hours || {}
                        });
                        ordersForm.reset({
                            delivery: userData.delivery || false,
                            receiveOrdersByWhatsapp: userData.receiveOrdersByWhatsapp || false,
                            whatsappOrderNumber: userData.whatsappOrderNumber || ''
                        });
                        
                    } else {
                        toast({ title: "Erro", description: "Não foi possível encontrar os dados do seu restaurante.", variant: "destructive" });
                    }
                }
            }).catch((error) => {
                console.error("Error fetching user data:", error);
                toast({ title: "Erro de Conexão", description: "Não foi possível buscar os dados do usuário.", variant: "destructive" });
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [currentUser, toast, companyForm, userForm, addressForm, operatingHoursForm, ordersForm]);

    const dayLabels: Record<(typeof weekDays)[number], string> = {
        monday: 'Segunda-feira',
        tuesday: 'Terça-feira',
        wednesday: 'Quarta-feira',
        thursday: 'Quinta-feira',
        friday: 'Sexta-feira',
        saturday: 'Sábado',
        sunday: 'Domingo',
    };

    async function handleUpdate(data: Partial<UserData>, successMessage: string) {
        if (!userCnpj) {
            toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const userRef = ref(realtimeDb, `users/${userCnpj}`);
            await update(userRef, data);
            toast({ title: "Sucesso!", description: successMessage });
        } catch (error) {
            console.error("Failed to update data:", error);
            toast({ title: "Erro", description: "Não foi possível salvar as alterações.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
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
                    <form onSubmit={companyForm.handleSubmit((values) => handleUpdate(values, 'Dados da empresa atualizados com sucesso.'))} className="space-y-4">
                         <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={companyForm.control}
                                name="restaurantName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Restaurante</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Ex: Cantina da Mama" {...field} disabled={isSubmitting}/>
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
                                    <Input placeholder="00.000.000/0000-00" {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</Button>
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
                    <form onSubmit={userForm.handleSubmit((values) => handleUpdate(values, 'Dados do usuário atualizados com sucesso.'))} className="space-y-4">
                         <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={userForm.control}
                                name="ownerName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Seu Nome</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Ex: Maria Silva" {...field} disabled={isSubmitting}/>
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
                                    <Input type="email" placeholder="seu@email.com" {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</Button>
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
                    <form onSubmit={addressForm.handleSubmit((values) => handleUpdate({ address: values }, 'Endereço atualizado com sucesso.'))} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                            control={addressForm.control}
                            name="street"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                <FormLabel>Rua</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Av. Brasil" {...field} disabled={isSubmitting} />
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
                                    <Input placeholder="123" {...field} disabled={isSubmitting} />
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
                                <Input placeholder="Apto 101, Bloco B" {...field} disabled={isSubmitting} />
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
                                    <Input placeholder="Centro" {...field} disabled={isSubmitting} />
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
                                    <Input placeholder="São Paulo" {...field} disabled={isSubmitting} />
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
                                    <Input placeholder="SP" {...field} disabled={isSubmitting} />
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
                                    <Input placeholder="01234-567" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Endereço'}</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        <Separator />

        <Card>
            <CardHeader>
                <CardTitle>Funcionamento e Contato</CardTitle>
                <CardDescription>Informe seus horários e contatos.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...operatingHoursForm}>
                    <form onSubmit={operatingHoursForm.handleSubmit((values) => handleUpdate(values, 'Horários e contatos atualizados com sucesso.'))} className="space-y-6">
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
                                                    disabled={isSubmitting}
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
                                                            <Input type="time" {...field} disabled={!isOpen || isSubmitting} />
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
                                                           <Input type="time" {...field} disabled={!isOpen || isSubmitting} />
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
                                        <Input placeholder="(99) 99999-9999" {...field} disabled={isSubmitting} />
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
                                        <Input placeholder="(99) 99999-9999" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Horários e Contatos'}</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Separator />

        <Card>
            <CardHeader>
                <CardTitle>Pedidos e Entregas</CardTitle>
                <CardDescription>
                    Gerencie o serviço de delivery e de pedidos pelo WhatsApp.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...ordersForm}>
                    <form onSubmit={ordersForm.handleSubmit((values) => handleUpdate(values, 'Configurações de pedidos atualizadas com sucesso.'))} className="space-y-6">
                       <FormField
                            control={ordersForm.control}
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
                                    disabled={isSubmitting}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
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
                                    disabled={isSubmitting}
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
                                    <FormLabel>Número do WhatsApp para Pedidos</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(99) 99999-9999" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormDescription>
                                        Este número será usado exclusivamente para receber os pedidos.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Configurações de Pedidos'}</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

      </main>
    </>
    );
}
