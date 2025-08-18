
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreVertical, Edit, Trash2, Search } from 'lucide-react';
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

type Addon = {
  id: number;
  name: string;
  price: number;
  description: string;
};

const addonsData: Addon[] = [
    { id: 1, name: 'Borda Recheada Catupiry', price: 8.00, description: 'Borda recheada com o autêntico Catupiry' },
    { id: 2, name: 'Borda Recheada Cheddar', price: 8.00, description: 'Borda cremosa com queijo cheddar' },
    { id: 3, name: 'Bacon Extra', price: 6.50, description: 'Uma porção extra de bacon crocante' },
    { id: 4, name: 'Catupiry Extra', price: 5.00, description: 'Mais cremosidade com uma porção extra de Catupiry' },
    { id: 5, name: 'Cheddar Extra', price: 5.00, description: 'Dose dupla de queijo cheddar' },
    { id: 6, name: 'Ovo', price: 3.00, description: 'Adicione um ovo frito ao seu prato' },
    { id: 7, name: 'Batata Frita P', price: 12.00, description: 'Porção pequena de batatas fritas sequinhas' },
    { id: 8, name: 'Guaraná Antarctica 2L', price: 10.00, description: 'Refrigerante gelado para acompanhar' },
];


const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome do adicional é obrigatório.' }),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: 'O preço deve ser um número positivo.' })
  ),
  description: z.string().optional(),
});

export default function AddonsPage() {
  const [addons, setAddons] = useState(addonsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [deletingAddon, setDeletingAddon] = useState<Addon | null>(null);

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

  function onCreateSubmit(values: z.infer<typeof formSchema>) {
    const newAddon = {
      id: Date.now(),
      name: values.name,
      price: values.price,
      description: values.description || ''
    };
    setAddons(prev => [...prev, newAddon]);
    toast({
      title: "Adicional Criado!",
      description: `O adicional "${values.name}" foi adicionado com sucesso.`,
    });
    createForm.reset({ name: '', price: 0, description: '' });
    setIsCreateModalOpen(false);
  }

  function onEditSubmit(values: z.infer<typeof formSchema>) {
    if (!editingAddon) return;

    setAddons(prev => prev.map(c => 
      c.id === editingAddon.id ? { ...c, name: values.name, price: values.price, description: values.description || '' } : c
    ));
    toast({
      title: "Adicional Atualizado!",
      description: `O adicional "${values.name}" foi atualizado com sucesso.`,
    });
    setIsEditModalOpen(false);
    setEditingAddon(null);
  }

  const handleEditClick = (addon: Addon) => {
    setEditingAddon(addon);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (addon: Addon) => {
    setDeletingAddon(addon);
  };

  const confirmDelete = () => {
    if (!deletingAddon) return;

    setAddons(prev => prev.filter(c => c.id !== deletingAddon.id));
    toast({
      title: "Adicional Excluído!",
      description: `O adicional "${deletingAddon.name}" foi removido com sucesso.`,
    });
    setDeletingAddon(null);
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
                {currentAddons.map((addon) => (
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
                ))}
              </TableBody>
            </Table>
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
