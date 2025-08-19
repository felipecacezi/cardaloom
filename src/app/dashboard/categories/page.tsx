
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ref, onValue, push, set, remove, get, query, orderByChild, equalTo } from 'firebase/database';
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

type Category = {
  id: string;
  name: string;
  description: string;
};

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome da categoria é obrigatório.' }),
  description: z.string().optional(),
});

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCnpj, setUserCnpj] = useState<string | null>(null);


  const itemsPerPage = 5;
  const { toast } = useToast();

  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '' },
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // Handle unauthenticated state if necessary
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const usersRef = ref(realtimeDb, 'users');
      const userQuery = query(usersRef, orderByChild('authUid'), equalTo(currentUser.uid));
      get(userQuery).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const cnpj = Object.keys(userData)[0];
          setUserCnpj(cnpj);
        } else {
          setIsLoading(false);
        }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (userCnpj) {
      const categoriesRef = ref(realtimeDb, `categories/${userCnpj}`);
      const unsubscribe = onValue(categoriesRef, (snapshot) => {
        const data = snapshot.val();
        const loadedCategories: Category[] = [];
        if (data) {
          for (const key in data) {
            loadedCategories.push({ id: key, ...data[key] });
          }
        }
        setCategories(loadedCategories);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [userCnpj]);


  useEffect(() => {
    if (editingCategory) {
      editForm.reset({
        name: editingCategory.name,
        description: editingCategory.description,
      });
    }
  }, [editingCategory, editForm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); 
  };
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  async function onCreateSubmit(values: z.infer<typeof formSchema>) {
    if (!userCnpj) {
        toast({ title: "Erro", description: "Usuário não identificado.", variant: "destructive" });
        return;
    }
    try {
        const categoriesRef = ref(realtimeDb, `categories/${userCnpj}`);
        const newCategoryRef = push(categoriesRef);
        await set(newCategoryRef, {
            name: values.name,
            description: values.description || ''
        });
        
        toast({
            title: "Categoria Criada!",
            description: `A categoria "${values.name}" foi adicionada com sucesso.`,
        });
        createForm.reset();
        setIsCreateModalOpen(false);

    } catch (error) {
         toast({ title: "Erro ao criar", description: "Não foi possível salvar a categoria.", variant: "destructive" });
    }
  }

  async function onEditSubmit(values: z.infer<typeof formSchema>) {
    if (!editingCategory || !userCnpj) return;
    try {
        const categoryRef = ref(realtimeDb, `categories/${userCnpj}/${editingCategory.id}`);
        await set(categoryRef, {
             name: values.name,
             description: values.description || ''
        });

        toast({
            title: "Categoria Atualizada!",
            description: `A categoria "${values.name}" foi atualizada com sucesso.`,
        });
        setIsEditModalOpen(false);
        setEditingCategory(null);
    } catch(error) {
        toast({ title: "Erro ao atualizar", description: "Não foi possível salvar as alterações.", variant: "destructive" });
    }
  }

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
  };

  const confirmDelete = async () => {
    if (!deletingCategory || !userCnpj) return;
    try {
        const categoryRef = ref(realtimeDb, `categories/${userCnpj}/${deletingCategory.id}`);
        await remove(categoryRef);

        toast({
            title: "Categoria Excluída!",
            description: `A categoria "${deletingCategory.name}" foi removida com sucesso.`,
        });
        setDeletingCategory(null);
    } catch(error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível remover a categoria.", variant: "destructive" });
        setDeletingCategory(null);
    }
  }

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Gerenciar Categorias</h1>
          <p className="text-sm text-muted-foreground">Adicione, edite ou remova as categorias do seu cardápio.</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Nova Categoria
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Nova Categoria</DialogTitle>
                    <DialogDescription>
                        Preencha as informações abaixo para adicionar uma nova categoria ao seu cardápio.
                    </DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                        <FormField
                            control={createForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Categoria</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Bebidas" {...field} />
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
                                        <Textarea placeholder="Uma breve descrição da categoria" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Salvar Categoria</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </header>
      <main className="flex-1 p-6">
       <AlertDialog open={!!deletingCategory} onOpenChange={(isOpen) => !isOpen && setDeletingCategory(null)}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Suas Categorias</CardTitle>
                    <CardDescription>Visualize e gerencie todas as suas categorias cadastradas.</CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pesquisar categoria..."
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
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCategories.length > 0 ? currentCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditClick(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem className="text-red-500" onSelect={() => handleDeleteClick(category)}>
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
                        <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                            Nenhuma categoria cadastrada ainda.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Mostrando {Math.min(indexOfFirstItem + 1, filteredCategories.length)}-{Math.min(indexOfLastItem, filteredCategories.length)} de {filteredCategories.length} categorias.
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
                    Essa ação não pode ser desfeita. Isso irá excluir permanentemente a categoria
                    <span className="font-bold"> "{deletingCategory?.name}"</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingCategory(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      </main>
       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Categoria</DialogTitle>
                    <DialogDescription>
                        Altere as informações da categoria selecionada.
                    </DialogDescription>
                </DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                        <FormField
                            control={editForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Categoria</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Bebidas" {...field} />
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
                                        <Textarea placeholder="Uma breve descrição da categoria" {...field} />
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

    