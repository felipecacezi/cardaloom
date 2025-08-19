
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { ref, onValue, get, push, set, remove } from 'firebase/database';
import { onAuthStateChanged, User } from 'firebase/auth';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreVertical, Edit, Trash2, Search, Loader2, X, Eye, EyeOff, Sparkles, Image as ImageIcon } from 'lucide-react';
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
import { auth, realtimeDb } from '@/lib/firebase';
import { suggestProductDescription } from '@/ai/flows/suggest-product-descriptions';


type Addon = {
  id: string;
  name: string;
  price: number;
};

type Category = {
  id: string;
  name: string;
};

type ImageInfo = {
    id: string;
    filePath: string;
    fileName: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageId: string;
  addons?: Record<string, boolean>; // Store addon IDs as keys
  isVisible: boolean;
};

const unformatCurrency = (value: string) => {
    if (typeof value !== 'string') return 0;
    const onlyNumbers = value.replace(/[^\d]/g, '');
    return parseFloat(onlyNumbers) / 100;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome do produto é obrigatório.' }),
  price: z.string().refine(value => !isNaN(unformatCurrency(value)) && unformatCurrency(value) > 0, {
      message: 'O preço deve ser um número positivo.'
  }),
  description: z.string().min(5, { message: "A descrição é obrigatória." }),
  category: z.string({ required_error: "A categoria é obrigatória."}).min(1, "A categoria é obrigatória."),
  imageId: z.string().optional(),
  addonIds: z.array(z.string()).optional(),
  isVisible: z.boolean().default(true),
});


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [images, setImages] = useState<Record<string, ImageInfo>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCnpj, setUserCnpj] = useState<string | null>(null);


  const itemsPerPage = 5;
  const { toast } = useToast();
  
  const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return '';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatCurrencyInput = (value: string) => {
    if (typeof value !== 'string') return '';
    const onlyNumbers = value.replace(/[^\d]/g, '');
    if (!onlyNumbers) return '';
    const numberValue = parseInt(onlyNumbers, 10) / 100;
    return formatCurrency(numberValue);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', price: '', description: '', category: '', imageId: '', addonIds: [], isVisible: true },
  });

   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserCnpj(null);
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
            setUserCnpj(userEntry[0]);
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
      const productsRef = ref(realtimeDb, `products/${userCnpj}`);
      const categoriesRef = ref(realtimeDb, `categories/${userCnpj}`);
      const addonsRef = ref(realtimeDb, `add-ons/${userCnpj}`);
      const imagesRef = ref(realtimeDb, `images/${userCnpj}`);

      const unsubscribeProducts = onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedProducts: Product[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setProducts(loadedProducts);
        setIsLoading(false);
      }, (error) => {
        console.error("Error loading products:", error);
        toast({ title: "Erro", description: "Não foi possível carregar os produtos.", variant: "destructive" });
        setIsLoading(false);
      });

      const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
        const data = snapshot.val();
        const loadedCategories: Category[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setCategories(loadedCategories);
      });

      const unsubscribeAddons = onValue(addonsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedAddons: Addon[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setAddons(loadedAddons);
      });

      const unsubscribeImages = onValue(imagesRef, (snapshot) => {
        const data = snapshot.val();
        setImages(data || {});
      });

      return () => {
        unsubscribeProducts();
        unsubscribeCategories();
        unsubscribeAddons();
        unsubscribeImages();
      };
    }
  }, [userCnpj, toast]);

  useEffect(() => {
    form.reset(getDefaultFormValues());
    if (editingProduct?.imageId && images[editingProduct.imageId]) {
      setImagePreviewUrl(images[editingProduct.imageId].filePath);
    } else {
      setImagePreviewUrl(null);
    }
  }, [editingProduct, form, images]);
  
  const getDefaultFormValues = () => {
    if(editingProduct) {
        return {
             name: editingProduct.name,
            price: formatCurrency(editingProduct.price),
            description: editingProduct.description,
            category: editingProduct.category,
            imageId: editingProduct.imageId,
            addonIds: editingProduct.addons ? Object.keys(editingProduct.addons) : [],
            isVisible: editingProduct.isVisible,
        }
    }
    return { name: '', price: '', description: '', category: '', imageId: '', addonIds: [], isVisible: true };
  }

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

  async function handleGenerateDescription() {
      const { name, category } = form.getValues();
      if (!name || !category) {
        toast({
          title: "Campos Faltando",
          description: "Por favor, preencha o nome do produto e a categoria para gerar uma descrição.",
          variant: "destructive"
        });
        return;
      }
      setIsGeneratingDescription(true);
      try {
        const result = await suggestProductDescription({
            productName: name,
            productCategory: categories.find(c => c.id === category)?.name || category,
            ingredients: '', // Ingredients are not in the form, can be added if needed
        });
        form.setValue('description', result.description);
         toast({
          title: "Descrição Gerada!",
          description: "A sugestão de descrição foi preenchida para você.",
        });
      } catch (error) {
        toast({
          title: "Erro ao Gerar Descrição",
          description: "Não foi possível gerar a descrição. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsGeneratingDescription(false);
      }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userCnpj) {
        toast({ title: "Erro", description: "Usuário não identificado para fazer upload.", variant: "destructive" });
        return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cnpj', userCnpj);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha no upload da imagem.');
        }

        const data = await response.json();
        form.setValue('imageId', data.imageId);
        setImagePreviewUrl(data.filePath);
        toast({ title: "Sucesso!", description: "Imagem enviada." });

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Erro no Upload!",
            description: error.message || "Não foi possível enviar a imagem. Tente novamente.",
        });
    } finally {
        setIsUploading(false);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userCnpj) {
        toast({ title: "Erro", description: "Usuário não identificado.", variant: "destructive" });
        return;
    }

    const productData = {
        name: values.name,
        price: unformatCurrency(values.price),
        description: values.description,
        category: values.category,
        imageId: values.imageId || '',
        addons: values.addonIds?.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
        isVisible: values.isVisible,
    };
    
    try {
        if (editingProduct) {
            const productRef = ref(realtimeDb, `products/${userCnpj}/${editingProduct.id}`);
            await set(productRef, productData);
            toast({
                title: "Produto Atualizado!",
                description: `O produto "${values.name}" foi atualizado com sucesso.`,
            });
        } else {
            const productsRef = ref(realtimeDb, `products/${userCnpj}`);
            const newProductRef = push(productsRef);
            await set(newProductRef, productData);
            toast({
                title: "Produto Criado!",
                description: `O produto "${values.name}" foi adicionado com sucesso.`,
            });
        }
        closeModal();
    } catch (error) {
        toast({ title: "Erro ao salvar", description: "Não foi possível salvar o produto.", variant: "destructive" });
    }
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  
  const handleCreateClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImagePreviewUrl(null);
    form.reset(getDefaultFormValues());
  }

  const confirmDelete = async () => {
    if (!deletingProduct || !userCnpj) return;

    try {
        const productRef = ref(realtimeDb, `products/${userCnpj}/${deletingProduct.id}`);
        await remove(productRef);
        toast({
          title: "Produto Excluído!",
          description: `O produto "${deletingProduct.name}" foi removido com sucesso.`,
        });
        setDeletingProduct(null);
    } catch(error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível remover o produto.", variant: "destructive" });
        setDeletingProduct(null);
    }
  }

  const getAddonsForProduct = (product: Product): Addon[] => {
    if (!product.addons) return [];
    const productAddonIds = Object.keys(product.addons);
    return addons.filter(addon => productAddonIds.includes(addon.id));
  };


  const renderFormFields = () => {
    const selectedAddonIds = form.watch('addonIds') || [];
    const selectedAddons = addons.filter(addon => selectedAddonIds.includes(addon.id));

    const addonOptions = addons.map(addon => ({
        value: addon.id,
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
                        <FormLabel>Preço</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="R$ 0,00" 
                                {...field} 
                                onChange={(e) => field.onChange(formatCurrencyInput(e.target.value))}
                            />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger disabled={categories.length === 0}>
                                <SelectValue placeholder={categories.length > 0 ? "Selecione uma categoria" : "Nenhuma categoria cadastrada"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
                     <div className="flex items-center gap-2">
                        <FormControl>
                            <Textarea rows={4} placeholder="Descreva o produto, seus ingredientes, etc." {...field} />
                        </FormControl>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            onClick={handleGenerateDescription} 
                            disabled={isGeneratingDescription}
                            title="Gerar descrição com IA"
                        >
                            {isGeneratingDescription ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        </Button>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormItem>
            <FormLabel>Imagem do Produto</FormLabel>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-md border border-dashed flex items-center justify-center bg-muted/50">
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : imagePreviewUrl ? (
                        <Image src={imagePreviewUrl} alt="Pré-visualização" width={64} height={64} className="rounded-md object-cover" />
                    ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>
                <FormControl>
                    <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1"
                    />
                </FormControl>
            </div>
             <FormField
                control={form.control}
                name="imageId"
                render={({ field }) => <input type="hidden" {...field} />}
             />
            <FormMessage />
        </FormItem>
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
                        placeholder={addons.length > 0 ? "Selecione um adicional..." : "Nenhum adicional cadastrado"}
                        searchPlaceholder="Pesquisar adicional..."
                        notFoundText="Nenhum adicional encontrado."
                        value={''}
                        onSelect={(value) => {
                            if (!field.value?.includes(value)) {
                                field.onChange([...(field.value || []), value]);
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
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
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
                    {currentProducts.length > 0 ? currentProducts.map((product) => (
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
                            <Image 
                                src={images[product.imageId]?.filePath || 'https://placehold.co/64x64.png'} 
                                alt={product.name} 
                                width={64} 
                                height={64} 
                                className="rounded-md object-cover" 
                             />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell><Badge variant="outline">{categories.find(c => c.id === product.category)?.name || product.category}</Badge></TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {getAddonsForProduct(product).length > 0 ? getAddonsForProduct(product).map(addon => (
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
                    )) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                Nenhum produto cadastrado ainda.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            )}
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
                disabled={currentPage === 1 || totalPages === 0}
              >
                Anterior
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
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
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => { if (!isOpen) closeModal(); }}>
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
                            <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
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
