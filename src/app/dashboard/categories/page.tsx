
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

type Category = {
  id: number;
  name: string;
  description: string;
};

const categoriesData: Category[] = [
  { id: 1, name: 'Pizzas Salgadas', description: 'As melhores pizzas com ingredientes frescos e selecionados.' },
  { id: 2, name: 'Pizzas Doces', description: 'Combinações surpreendentes para adoçar o seu paladar.' },
  { id: 3, name: 'Bebidas', description: 'Refrigerantes, sucos naturais, cervejas e águas.' },
  { id: 4, name: 'Sobremesas', description: 'Deliciosas sobremesas caseiras para finalizar com chave de ouro.' },
  { id: 5, name: 'Entradas e Porções', description: 'Aperitivos perfeitos para começar ou compartilhar.' },
  { id: 6, name: 'Combos Especiais', description: 'Ofertas imperdíveis para toda a família e amigos.' },
  { id: 7, name: 'Lanches', description: 'Sanduíches e hambúrgueres artesanais.' },
  { id: 8, name: 'Opções Vegetarianas', description: 'Pratos deliciosos sem carne.' },
  { id: 9, name: 'Saladas', description: 'Opções leves e saudáveis.' },
  { id: 10, name: 'Massas', description: 'Receitas italianas clássicas e da casa.' },
];

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome da categoria é obrigatório.' }),
  description: z.string().optional(),
});

export default function CategoriesPage() {
  const [categories, setCategories] = useState(categoriesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

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

  function onCreateSubmit(values: z.infer<typeof formSchema>) {
    const newCategory = {
      id: Date.now(), 
      name: values.name,
      description: values.description || ''
    };
    setCategories(prev => [...prev, newCategory]);
    toast({
      title: "Categoria Criada!",
      description: `A categoria "${values.name}" foi adicionada com sucesso.`,
    });
    createForm.reset();
    setIsCreateModalOpen(false);
  }

  function onEditSubmit(values: z.infer<typeof formSchema>) {
    if (!editingCategory) return;

    setCategories(prev => prev.map(c => 
      c.id === editingCategory.id ? { ...c, name: values.name, description: values.description || '' } : c
    ));
    toast({
      title: "Categoria Atualizada!",
      description: `A categoria "${values.name}" foi atualizada com sucesso.`,
    });
    setIsEditModalOpen(false);
    setEditingCategory(null);
  }

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
  };

  const confirmDelete = () => {
    if (!deletingCategory) return;

    setCategories(prev => prev.filter(c => c.id !== deletingCategory.id));
    toast({
      title: "Categoria Excluída!",
      description: `A categoria "${deletingCategory.name}" foi removida com sucesso.`,
    });
    setDeletingCategory(null);
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCategories.map((category) => (
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
                ))}
              </TableBody>
            </Table>
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

        <AlertDialog open={!!deletingCategory} onOpenChange={(isOpen) => !isOpen && setDeletingCategory(null)}>
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
    </>
  );
}
