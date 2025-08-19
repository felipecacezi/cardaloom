
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ref, onValue, push, set, remove, get } from 'firebase/database';
import { onAuthStateChanged, User } from 'firebase/auth';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreVertical, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { auth, realtimeDb } from '@/lib/firebase';

type Addon = {
  id: string;
  name: string;
  price: number;
  description: string;
};

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome do adicional é obrigatório.' }),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: 'O preço deve ser um número positivo.' })
  ),
  description: z.string().optional(),
});

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [deletingAddon, setDeletingAddon] = useState<Addon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCnpj, setUserCnpj] = useState<string | null>(null);

  const itemsPerPage = 5;
  const { toast } = useToast();

  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', price: 0, description: '' },
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
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
          const userCnpj = Object.keys(usersData).find(
            (cnpj) => usersData[cnpj].authUid === currentUser.uid
          );
          
          if (userCnpj) {
            setUserCnpj(userCnpj);
          } else {
            console.error("User CNPJ not found for UID:", currentUser.uid);
            toast({ title: "Erro", description: "Não foi possível encontrar os dados do seu restaurante.", variant: "destructive" });
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }).catch((error) => {
        console.error("Error fetching user data:", error);
        toast({ title: "Erro de Conexão", description: "Não foi possível buscar os dados do usuário.", variant: "destructive" });
        setIsLoading(false);
      });
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (userCnpj) {
      const addonsRef = ref(realtimeDb, `add-ons/${userCnpj}`);
      const unsubscribe = onValue(addonsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedAddons: Addon[] = [];
        if (data) {
          for (const key in data) {
            loadedAddons.push({ id: key, ...data[key] });
          }
        }
        setAddons(loadedAddons);
        setIsLoading(false);
      }, (error) => {
        console.error(error);
        toast({ title: "Erro de Conexão", description: "Não foi possível carregar os adicionais.", variant: "destructive" });
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [userCnpj, toast]);


  useEffect(() => {
    if (editingAddon) {
      editForm.reset({
        name: editingAddon.name,
        price: editingAddon.price,
        description: editingAddon.description,
      });
    }
  }, [editingAddon, editForm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); 
  };
  
  const filteredAddons = addons.filter(addon =>
    addon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAddons = filteredAddons.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredAddons.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  async function onCreateSubmit(values: z.infer<typeof formSchema>) {
    if (!userCnpj) {
        toast({ title: "Erro", description: "Usuário não identificado.", variant: "destructive" });
        return;
    }
    try {
        const addonsRef = ref(realtimeDb, `add-ons/${userCnpj}`);
        const newAddonRef = push(addonsRef);
        await set(newAddonRef, {
            name: values.name,
            price: values.price,
            description: values.description || ''
        });
        
        toast({
            title: "Adicional Criado!",
            description: `O adicional "${values.name}" foi adicionado com sucesso.`,
        });
        createForm.reset({ name: '', price: 0, description: '' });
        setIsCreateModalOpen(false);

    } catch (error) {
         toast({ title: "Erro ao criar", description: "Não foi possível salvar o adicional.", variant: "destructive" });
    }
  }

  async function onEditSubmit(values: z.infer<typeof formSchema>) {
    if (!editingAddon || !userCnpj) return;

    try {
        const addonRef = ref(realtimeDb, `add-ons/${userCnpj}/${editingAddon.id}`);
        await set(addonRef, {
             name: values.name,
             price: values.price,
             description: values.description || ''
        });

        toast({
            title: "Adicional Atualizado!",
            description: `O adicional "${values.name}" foi atualizado com sucesso.`,
        });
        setIsEditModalOpen(false);
        setEditingAddon(null);
    } catch(error) {
        toast({ title: "Erro ao atualizar", description: "Não foi possível salvar as alterações.", variant: "destructive" });
    }
  }

  const handleEditClick = (addon: Addon) => {
    setEditingAddon(addon);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (addon: Addon) => {
    setDeletingAddon(addon);
  };

  const confirmDelete = async () => {
    if (!deletingAddon || !userCnpj) return;

    try {
        const addonRef = ref(realtimeDb, `add-ons/${userCnpj}/${deletingAddon.id}`);
        await remove(addonRef);

        toast({
            title: "Adicional Excluído!",
            description: `O adicional "${deletingAddon.name}" foi removido com sucesso.`,
        });
        setDeletingAddon(null);
    } catch(error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível remover o adicional.", variant: "destructive" });
        setDeletingAddon(null);
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Gerenciar Adicionais</h1>
          <p className="text-sm text-muted-foreground">Adicione, edite ou remova os adicionais do seu cardápio.</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Novo Adicional
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Novo Adicional</DialogTitle>
                    <DialogDescription>
                        Preencha as informações abaixo para adicionar um novo adicional.
                    </DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                        <FormField
                            control={createForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Adicional</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Borda Recheada" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={createForm.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preço (R$)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="Ex: 8.50" {...field} onChange={e => field.onChange(e.target.value)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={createForm.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Uma breve descrição do adicional" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Salvar Adicional</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </header>
      <main className="flex-1 p-6">
       <AlertDialog open={!!deletingAddon} onOpenChange={(isOpen) => !isOpen && setDeletingAddon(null)}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Seus Adicionais</CardTitle>
                    <CardDescription>Visualize e gerencie todos os seus adicionais cadastrados.</CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pesquisar adicional..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAddons.length > 0 ? currentAddons.map((addon) => (
                      <TableRow key={addon.id}>
                        <TableCell className="font-medium">{addon.name}</TableCell>
                        <TableCell>{formatCurrency(addon.price)}</TableCell>
                        <TableCell>{addon.description}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEditClick(addon)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                 <DropdownMenuItem className="text-red-500" onSelect={() => handleDeleteClick(addon)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Excluir</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                Nenhum adicional cadastrado ainda.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
             )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Mostrando {Math.min(indexOfFirstItem + 1, filteredAddons.length)}-{Math.min(indexOfLastItem, filteredAddons.length)} de {filteredAddons.length} adicionais.
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </CardFooter>
        </Card>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso irá excluir permanentemente o adicional
                    <span className="font-bold"> "{deletingAddon?.name}"</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingAddon(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      </main>
       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Adicional</DialogTitle>
                    <DialogDescription>
                        Altere as informações do adicional selecionado.
                    </DialogDescription>
                </DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                        <FormField
                            control={editForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Adicional</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Borda Recheada" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={editForm.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preço (R$)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="Ex: 8.50" {...field} onChange={e => field.onChange(e.target.value)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={editForm.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Uma breve descrição do adicional" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Salvar Alterações</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </>
  );
}
