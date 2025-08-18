
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreVertical, Edit, Trash2, Search, Loader2, X, Eye, EyeOff } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Combobox } from '@/components/ui/combobox';
import { Switch } from '@/components/ui/switch';


type Addon = {
  id: number;
  name: string;
  price: number;
};

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  addons: Addon[];
  isVisible: boolean;
};

const productsData: Product[] = [
    { id: 1, name: 'Pizza Margherita', price: 45.00, description: 'Molho de tomate, mussarela fresca e manjericão.', category: 'Pizzas Salgadas', image: 'https://placehold.co/100x100.png', addons: [], isVisible: true },
    { id: 2, name: 'Pizza Calabresa', price: 48.50, description: 'Molho de tomate, mussarela, calabresa e cebola.', category: 'Pizzas Salgadas', image: 'https://placehold.co/100x100.png', addons: [{ id: 1, name: 'Borda Recheada Catupiry', price: 8.00 }, { id: 3, name: 'Bacon Extra', price: 6.50 }], isVisible: true },
    { id: 3, name: 'Pizza Quatro Queijos', price: 52.00, description: 'Molho de tomate, mussarela, provolone, parmesão e gorgonzola.', category: 'Pizzas Salgadas', image: 'https://placehold.co/100x100.png', addons: [{ id: 1, name: 'Borda Recheada Catupiry', price: 8.00 }, { id: 2, name: 'Borda Recheada Cheddar', price: 8.00 }], isVisible: true },
    { id: 4, name: 'Pizza de Chocolate', price: 40.00, description: 'Chocolate ao leite com morangos frescos.', category: 'Pizzas Doces', image: 'https://placehold.co/100x100.png', addons: [], isVisible: true },
    { id: 5, name: 'Coca-Cola 2L', price: 10.00, description: 'Refrigerante gelado para acompanhar sua pizza.', category: 'Bebidas', image: 'https://placehold.co/100x100.png', addons: [], isVisible: false },
];

const categoriesData = [
  { id: 1, name: 'Pizzas Salgadas' },
  { id: 2, name: 'Pizzas Doces' },
  { id: 3, name: 'Bebidas' },
  { id: 4, name: 'Sobremesas' },
];

const addonsData: Addon[] = [
    { id: 1, name: 'Borda Recheada Catupiry', price: 8.00 },
    { id: 2, name: 'Borda Recheada Cheddar', price: 8.00 },
    { id: 3, name: 'Bacon Extra', price: 6.50 },
    { id: 4, name: 'Catupiry Extra', price: 5.00 },
    { id: 5, name: 'Cheddar Extra', price: 5.00 },
    { id: 6, name: 'Ovo', price: 3.00 },
    { id: 7, name: 'Batata Frita P', price: 12.00 },
    { id: 8, name: 'Guaraná Antarctica 2L', price: 10.00 },
];


const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome do produto é obrigatório.' }),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: 'O preço deve ser um número positivo.' })
  ),
  description: z.string().min(5, { message: "A descrição é obrigatória." }),
  category: z.string({ required_error: "A categoria é obrigatória."}),
  image: z.any(),
  addonIds: z.array(z.number()).optional(),
  isVisible: z.boolean().default(true),
});


export default function ProductsPage() {
  const [products, setProducts] = useState(productsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const itemsPerPage = 5;
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', price: 0, description: '', category: '', addonIds: [], isVisible: true },
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        price: editingProduct.price,
        description: editingProduct.description,
        category: editingProduct.category,
        image: editingProduct.image,
        addonIds: editingProduct.addons.map(a => a.id),
        isVisible: editingProduct.isVisible,
      });
    } else {
        form.reset({ name: '', price: 0, description: '', category: '', image: null, addonIds: [], isVisible: true });
    }
  }, [editingProduct, form]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUploading(true);
    let imageUrl = editingProduct?.image || 'https://placehold.co/100x100.png';

    if (values.image && typeof values.image !== 'string' && values.image[0]) {
        const file = values.image[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Falha no upload da imagem.');
            }

            const data = await response.json();
            imageUrl = data.filePath;

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro no Upload!",
                description: "Não foi possível enviar a imagem. Tente novamente.",
            });
            setIsUploading(false);
            return;
        }
    }
    
    const selectedAddons = addonsData.filter(addon => values.addonIds?.includes(addon.id));


     if (editingProduct) {
        setProducts(prev => prev.map(p =>
            p.id === editingProduct.id ? { ...editingProduct, ...values, image: imageUrl, addons: selectedAddons, isVisible: values.isVisible } : p
        ));
        toast({
            title: "Produto Atualizado!",
            description: `O produto "${values.name}" foi atualizado com sucesso.`,
        });
        setIsEditModalOpen(false);
        setEditingProduct(null);
     } else {
        const newProduct: Product = {
            id: Date.now(),
            name: values.name,
            price: values.price,
            description: values.description,
            category: values.category,
            image: imageUrl,
            addons: selectedAddons,
            isVisible: values.isVisible,
        };
        setProducts(prev => [...prev, newProduct]);
        toast({
            title: "Produto Criado!",
            description: `O produto "${values.name}" foi adicionado com sucesso.`,
        });
        setIsCreateModalOpen(false);
     }
     form.reset({ name: '', price: 0, description: '', category: '', image: null, addonIds: [], isVisible: true });
     setIsUploading(false);
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };
  
  const handleCreateClick = () => {
    setEditingProduct(null);
    form.reset({ name: '', price: 0, description: '', category: '', image: null, addonIds: [], isVisible: true });
    setIsCreateModalOpen(true);
  }

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
  
  const renderFormFields = () => {
    const imageField = form.watch('image');
    let previewUrl = '';
    if (typeof imageField === 'string') {
        previewUrl = imageField;
    } else if (imageField && imageField[0]) {
        previewUrl = URL.createObjectURL(imageField[0]);
    }
    
    const selectedAddonIds = form.watch('addonIds') || [];
    const selectedAddons = addonsData.filter(addon => selectedAddonIds.includes(addon.id));

    const addonOptions = addonsData.map(addon => ({
        value: addon.id.toString(),
        label: `${addon.name} (${formatCurrency(addon.price)})`,
    }));

    return (
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
                    <FormLabel>Descrição</FormLabel>
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
            render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                    <FormLabel>Imagem do Produto</FormLabel>
                    <div className="flex items-center gap-4">
                      {previewUrl && <Image src={previewUrl} alt="Pré-visualização" width={64} height={64} className="rounded-md object-cover" />}
                       <FormControl>
                            <Input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => onChange(e.target.files)}
                                {...rest}
                            />
                        </FormControl>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
         <FormField
            control={form.control}
            name="isVisible"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel>Visível no Cardápio</FormLabel>
                        <p className="text-sm text-muted-foreground">
                            Define se este produto será exibido para os seus clientes.
                        </p>
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
        <Separator className="my-4" />
        <div>
            <h3 className="text-lg font-medium">Opcionais do Produto</h3>
            <p className="text-sm text-muted-foreground">Selecione os adicionais disponíveis para este produto.</p>
        </div>
        <FormField
            control={form.control}
            name="addonIds"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Adicionais</FormLabel>
                    <Combobox
                        options={addonOptions}
                        placeholder="Selecione um adicional..."
                        searchPlaceholder="Pesquisar adicional..."
                        notFoundText="Nenhum adicional encontrado."
                        value={''}
                        onSelect={(value) => {
                            const addonId = parseInt(value, 10);
                            if (!field.value?.includes(addonId)) {
                                field.onChange([...(field.value || []), addonId]);
                            }
                        }}
                    />
                    <FormMessage />
                     <div className="flex flex-wrap gap-2 mt-2">
                        {selectedAddons.map((addon) => (
                            <Badge key={addon.id} variant="secondary" className="flex items-center gap-1">
                                {addon.name}
                                <button
                                    type="button"
                                    className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                                    onClick={() => {
                                        field.onChange(field.value?.filter((id) => id !== addon.id));
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </FormItem>
            )}
        />
    </>
    )
  };


  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Gerenciar Produtos</h1>
          <p className="text-sm text-muted-foreground">Adicione, edite ou remova os produtos do seu cardápio.</p>
        </div>
        <Button onClick={handleCreateClick}>
            <PlusCircle className="mr-2" />
            Novo Produto
        </Button>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Opcionais</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                        {product.isVisible ? (
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-green-500" />
                                <span className="sr-only">Visível</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                 <span className="sr-only">Oculto</span>
                            </div>
                        )}
                    </TableCell>
                    <TableCell>
                        <Image src={product.image} alt={product.name} width={64} height={64} className="rounded-md object-cover" />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-1">
                            {product.addons.length > 0 ? product.addons.map(addon => (
                                <Badge key={addon.id} variant="secondary">{addon.name}</Badge>
                            )) : <span className="text-xs text-muted-foreground">N/A</span>}
                        </div>
                    </TableCell>
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
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editar Produto' : 'Criar Novo Produto'}</DialogTitle>
                <DialogDescription>
                    {editingProduct ? 'Altere as informações do produto selecionado.' : 'Preencha as informações abaixo para adicionar um novo produto.'}
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {renderFormFields()}
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isUploading}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUploading ? 'Salvando...' : (editingProduct ? 'Salvar Alterações' : 'Salvar Produto')}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    