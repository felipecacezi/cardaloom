
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreVertical, Edit, Trash2, Search, Sparkles, Loader2 } from 'lucide-react';
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
import { suggestProductDescription, SuggestProductDescriptionInput } from '@/ai/flows/suggest-product-descriptions';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

const productsData: Product[] = [
    { id: 1, name: 'Pizza Margherita', price: 45.00, description: 'Molho de tomate, mussarela fresca e manjericão.', category: 'Pizzas Salgadas', image: 'https://placehold.co/100x100.png' },
    { id: 2, name: 'Pizza Calabresa', price: 48.50, description: 'Molho de tomate, mussarela, calabresa e cebola.', category: 'Pizzas Salgadas', image: 'https://placehold.co/100x100.png' },
    { id: 3, name: 'Pizza Quatro Queijos', price: 52.00, description: 'Molho de tomate, mussarela, provolone, parmesão e gorgonzola.', category: 'Pizzas Salgadas', image: 'https://placehold.co/100x100.png' },
    { id: 4, name: 'Pizza de Chocolate', price: 40.00, description: 'Chocolate ao leite com morangos frescos.', category: 'Pizzas Doces', image: 'https://placehold.co/100x100.png' },
    { id: 5, name: 'Coca-Cola 2L', price: 10.00, description: 'Refrigerante gelado para acompanhar sua pizza.', category: 'Bebidas', image: 'https://placehold.co/100x100.png' },
];

const categoriesData = [
  { id: 1, name: 'Pizzas Salgadas' },
  { id: 2, name: 'Pizzas Doces' },
  { id: 3, name: 'Bebidas' },
  { id: 4, name: 'Sobremesas' },
];

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome do produto é obrigatório.' }),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: 'O preço deve ser um número positivo.' })
  ),
  description: z.string().min(5, { message: "A descrição é obrigatória." }),
  category: z.string({ required_error: "A categoria é obrigatória."}),
  image: z.string().url({ message: "Por favor, insira uma URL de imagem válida." }).optional(),
});


export default function ProductsPage() {
  const [products, setProducts] = useState(productsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const itemsPerPage = 5;
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', price: 0, description: '', category: '' },
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        price: editingProduct.price,
        description: editingProduct.description,
        category: editingProduct.category,
        image: editingProduct.image,
      });
    }
  }, [editingProduct, form]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSuggestDescription = async () => {
      const { name, category, description } = form.getValues();
      if (!name || !category) {
        toast({
            variant: "destructive",
            title: "Ops!",
            description: "Preencha o nome e a categoria para sugerir uma descrição.",
        });
        return;
      }
      setIsGenerating(true);
      try {
        const result = await suggestProductDescription({
            productName: name,
            productCategory: category,
            ingredients: '', 
            existingDescription: description,
        });
        form.setValue('description', result.description, { shouldValidate: true });
        toast({
            title: "Descrição Sugerida!",
            description: "Uma nova descrição foi gerada para você.",
        });
      } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao Sugerir",
            description: "Não foi possível gerar uma descrição. Tente novamente.",
        });
      } finally {
        setIsGenerating(false);
      }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  function onSubmit(values: z.infer<typeof formSchema>) {
     if (editingProduct) {
        setProducts(prev => prev.map(p =>
            p.id === editingProduct.id ? { ...editingProduct, ...values } : p
        ));
        toast({
            title: "Produto Atualizado!",
            description: `O produto "${values.name}" foi atualizado com sucesso.`,
        });
        setIsEditModalOpen(false);
        setEditingProduct(null);
     } else {
        const newProduct = {
            id: Date.now(),
            ...values,
            image: values.image || 'https://placehold.co/100x100.png'
        };
        setProducts(prev => [...prev, newProduct]);
        toast({
            title: "Produto Criado!",
            description: `O produto "${values.name}" foi adicionado com sucesso.`,
        });
        setIsCreateModalOpen(false);
     }
     form.reset({ name: '', price: 0, description: '', category: '' });
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingProduct) return;
    setProducts(prev => prev.filter(c => c.id !== deletingProduct.id));
    toast({
      title: "Produto Excluído!",
      description: `O produto "${deletingProduct.name}" foi removido com sucesso.`,
    });
    setDeletingProduct(null);
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const renderFormFields = () => (
    <>
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Produto</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Pizza Margherita" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="Ex: 45.50" {...field} onChange={e => field.onChange(e.target.value)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {categoriesData.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex justify-between items-center">
                        Descrição
                        <Button type="button" size="sm" variant="outline" onClick={handleSuggestDescription} disabled={isGenerating}>
                             {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Sugerir com IA
                        </Button>
                    </FormLabel>
                    <FormControl>
                        <Textarea rows={4} placeholder="Descreva o produto, seus ingredientes, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>URL da Imagem (Opcional)</FormLabel>
                    <FormControl>
                        <Input placeholder="https://exemplo.com/imagem.png" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    </>
  );


  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Gerenciar Produtos</h1>
          <p className="text-sm text-muted-foreground">Adicione, edite ou remova os produtos do seu cardápio.</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Novo Produto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Criar Novo Produto</DialogTitle>
                    <DialogDescription>
                        Preencha as informações abaixo para adicionar um novo produto.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {renderFormFields()}
                         <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Salvar Produto</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </header>
      <main className="flex-1 p-6">
       <AlertDialog open={!!deletingProduct} onOpenChange={(isOpen) => !isOpen && setDeletingProduct(null)}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Seus Produtos</CardTitle>
                    <CardDescription>Visualize e gerencie todos os seus produtos cadastrados.</CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pesquisar produto..."
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
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                        <Image src={product.image} alt={product.name} width={64} height={64} className="rounded-md object-cover" />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{product.description}</TableCell>
                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditClick(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem className="text-red-500" onSelect={() => setDeletingProduct(product)}>
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
              Mostrando {Math.min(indexOfFirstItem + 1, filteredProducts.length)}-{Math.min(indexOfLastItem, filteredProducts.length)} de {filteredProducts.length} produtos.
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
                    Essa ação não pode ser desfeita. Isso irá excluir permanentemente o produto
                    <span className="font-bold"> "{deletingProduct?.name}"</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingProduct(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      </main>
       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Editar Produto</DialogTitle>
                    <DialogDescription>
                        Altere as informações do produto selecionado.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {renderFormFields()}
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

    