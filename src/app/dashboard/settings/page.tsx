
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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
      </main>
    </>
    );
}
