
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ref, get } from 'firebase/database';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ShoppingCart, Clock, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { realtimeDb } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type Restaurant = {
  name: string;
  operatingHours: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
  whatsappNumber: string;
  delivery: boolean;
};

type Category = { id: string; name: string };
type Addon = { id: string; name: string; price: number };
type ImageInfo = { id: string; filePath: string };
type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageId: string;
  addons?: Record<string, boolean>;
  isVisible: boolean;
};
type CartItem = {
    product: Product;
    quantity: number;
    selectedAddons: Addon[];
    totalPrice: number;
}

const weekDayLabels: Record<string, string> = {
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

const formatCurrency = (value: number) => {
    return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function MenuPage() {
    const searchParams = useSearchParams();
    const restaurantId = searchParams.get('id');

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [addons, setAddons] = useState<Addon[]>([]);
    const [images, setImages] = useState<Record<string, ImageInfo>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);
    const [isOperatingHoursOpen, setIsOperatingHoursOpen] = useState(false);

    const [customerName, setCustomerName] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'cash' | undefined>(undefined);
    const [changeFor, setChangeFor] = useState('');

    useEffect(() => {
        if (!restaurantId) {
            setError("ID do restaurante não fornecido. Adicione '?id=SEU_CNPJ' à URL.");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const userRef = ref(realtimeDb, `users/${restaurantId}`);
                const categoriesRef = ref(realtimeDb, `categories/${restaurantId}`);
                const productsRef = ref(realtimeDb, `products/${restaurantId}`);
                const addonsRef = ref(realtimeDb, `add-ons/${restaurantId}`);
                const imagesRef = ref(realtimeDb, `images/${restaurantId}`);

                const [userSnap, catSnap, prodSnap, addonSnap, imgSnap] = await Promise.all([
                    get(userRef),
                    get(categoriesRef),
                    get(productsRef),
                    get(addonsRef),
                    get(imagesRef),
                ]);

                if (!userSnap.exists()) {
                    throw new Error("Restaurante não encontrado. Verifique o ID fornecido.");
                }

                const userData = userSnap.val();
                setRestaurant({
                    name: userData.restaurantName,
                    operatingHours: userData.hours,
                    whatsappNumber: userData.whatsappOrderNumber,
                    delivery: userData.delivery,
                });

                const catData = catSnap.val() || {};
                setCategories(Object.keys(catData).map(key => ({ id: key, ...catData[key] })));
                
                const prodData = prodSnap.val() || {};
                setProducts(Object.keys(prodData).map(key => ({ id: key, ...prodData[key] })));

                const addonData = addonSnap.val() || {};
                setAddons(Object.keys(addonData).map(key => ({ id: key, ...addonData[key] })));

                setImages(imgSnap.val() || {});

            } catch (err: any) {
                console.error(err);
                setError(err.message || "Ocorreu um erro ao carregar o cardápio.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [restaurantId]);

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setSelectedAddons([]);
        setIsProductDialogOpen(true);
    };

    const handleAddonToggle = (addon: Addon, isChecked: boolean) => {
        if (isChecked) {
            setSelectedAddons(prev => [...prev, addon]);
        } else {
            setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
        }
    };

    const calculateItemPrice = () => {
        if (!selectedProduct) return 0;
        const addonsPrice = selectedAddons.reduce((acc, addon) => acc + addon.price, 0);
        return (selectedProduct.price + addonsPrice) * quantity;
    };

    const addToCart = () => {
        if (!selectedProduct) return;
        const cartItem: CartItem = {
            product: selectedProduct,
            quantity,
            selectedAddons,
            totalPrice: calculateItemPrice(),
        };
        setCart(prev => [...prev, cartItem]);
        setIsProductDialogOpen(false);
    };
    
    const totalCartPrice = cart.reduce((acc, item) => acc + item.totalPrice, 0);

     const generateWhatsAppMessage = () => {
        let message = `Olá, ${restaurant?.name}! Gostaria de fazer o seguinte pedido:\n\n`;

        cart.forEach(item => {
            message += `*${item.quantity}x ${item.product.name}* (${formatCurrency(item.product.price)})\n`;
            if (item.selectedAddons.length > 0) {
                message += "  Adicionais:\n";
                item.selectedAddons.forEach(addon => {
                    message += `  - ${addon.name} (${formatCurrency(addon.price)})\n`;
                });
            }
            message += `  Subtotal: *${formatCurrency(item.totalPrice)}*\n\n`;
        });
        
        message += `*Total do Pedido: ${formatCurrency(totalCartPrice)}*\n\n`;
        message += `--- DADOS PARA ${restaurant?.delivery ? 'ENTREGA' : 'RETIRADA'} ---\n`;
        message += `*Nome do Cliente:* ${customerName}\n`;
        if (restaurant?.delivery) {
            message += `*Endereço:* ${deliveryAddress}\n`;
        }
        
        let paymentInfo = '';
        if (paymentMethod === 'card') paymentInfo = 'Cartão';
        if (paymentMethod === 'pix') paymentInfo = 'PIX';
        if (paymentMethod === 'cash') {
             paymentInfo = `Dinheiro`;
             if(changeFor) {
                paymentInfo += ` (Levar troco para ${changeFor})`;
             } else {
                paymentInfo += ` (Não precisa de troco)`;
             }
        }
        message += `*Forma de Pagamento:* ${paymentInfo}\n`;

        return encodeURIComponent(message);
    };

    const sendOrderToWhatsApp = () => {
        if (!restaurant?.whatsappNumber) {
            alert('Número do WhatsApp para pedidos não configurado.');
            return;
        };
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    const checkRestaurantOpen = () => {
        if (!restaurant?.operatingHours) return false;
        const today = new Date();
        const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const currentTime = today.getHours() * 60 + today.getMinutes();
        
        const schedule = restaurant.operatingHours[dayOfWeek];

        if (!schedule || !schedule.isOpen) {
            return false;
        }

        const [openHour, openMinute] = schedule.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = schedule.closeTime.split(':').map(Number);

        const openTimeInMinutes = openHour * 60 + openMinute;
        let closeTimeInMinutes = closeHour * 60 + closeMinute;
        
        // Handle overnight closing times (e.g., 18:00 - 02:00)
        if (closeTimeInMinutes < openTimeInMinutes) {
            closeTimeInMinutes += 24 * 60; // Add 24 hours to the closing time
            if(currentTime < openTimeInMinutes) {
               // Adjust current time if it's past midnight
               return (currentTime + 24*60) < closeTimeInMinutes;
            }
        }
        
        return currentTime >= openTimeInMinutes && currentTime < closeTimeInMinutes;
    }
    
    const isRestaurantOpen = checkRestaurantOpen();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-muted/20">
                 <header className="relative h-48 md:h-64 w-full">
                     <Skeleton className="h-full w-full" />
                </header>
                <main className="container mx-auto px-4 py-8">
                     <Skeleton className="h-10 w-1/3 mb-6" />
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                             <Card key={i}>
                                <Skeleton className="h-48 w-full rounded-t-lg" />
                                <CardContent className="p-4 space-y-2">
                                     <Skeleton className="h-6 w-3/4" />
                                     <Skeleton className="h-4 w-full" />
                                     <Skeleton className="h-4 w-5/6" />
                                     <div className="flex justify-between items-center pt-4">
                                        <Skeleton className="h-8 w-1/4" />
                                        <Skeleton className="h-10 w-1/3" />
                                     </div>
                                </CardContent>
                            </Card>
                        ))}
                     </div>
                </main>
            </div>
        )
    }

    if (error) {
       return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 text-center p-4">
                <h1 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar o cardápio</h1>
                <p className="text-muted-foreground">{error}</p>
                 <Button onClick={() => window.location.reload()} className="mt-6">Tentar Novamente</Button>
            </div>
        );
    }
    
    const getAddonsForProduct = (product: Product): Addon[] => {
        if (!product.addons) return [];
        const productAddonIds = Object.keys(product.addons);
        return addons.filter(addon => productAddonIds.includes(addon.id));
    };
    
    const getProductCategoryName = (product: Product) => {
        const category = categories.find(c => c.id === product.category);
        return category ? category.name : 'Sem Categoria';
    };

    return (
    <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <div className="min-h-screen bg-muted/20">
            <header className="relative h-48 md:h-64 w-full">
                <Image
                    src="https://placehold.co/1200x400.png"
                    alt="Banner do Restaurante"
                    fill
                    objectFit="cover"
                    className="z-0"
                    data-ai-hint="restaurant banner"
                />
                <div className="absolute inset-0 bg-black/50 z-10" />
                <div className="container mx-auto px-4 absolute inset-0 z-20 flex flex-col justify-center items-center text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">{restaurant?.name}</h1>
                     <div className="flex items-center gap-4 mt-2">
                        {isRestaurantOpen ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-base">Aberto</Badge>
                        ) : (
                            <Badge variant="destructive" className="text-base">Fechado</Badge>
                        )}
                         <Dialog open={isOperatingHoursOpen} onOpenChange={setIsOperatingHoursOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-transparent text-white border-white hover:bg-white hover:text-black">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Horários
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xs">
                                <DialogHeader>
                                    <DialogTitle className="text-center">Horários de Funcionamento</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2">
                                    {restaurant?.operatingHours && Object.entries(restaurant.operatingHours).map(([day, hours]) => (
                                        <div key={day} className="flex justify-between text-sm">
                                            <span className="font-medium">{weekDayLabels[day]}:</span>
                                            <span>
                                                {hours.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Fechado'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {categories.map(category => {
                    const categoryProducts = products.filter(p => p.category === category.id && p.isVisible);
                    if (categoryProducts.length === 0) return null;

                    return (
                        <section key={category.id} id={`category-${category.id}`} className="mb-12">
                            <h2 className="text-3xl font-bold tracking-tight mb-6">{category.name}</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryProducts.map(product => (
                                    <Card key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col">
                                        <CardContent className="p-0">
                                            <div className="relative h-48 w-full">
                                                <Image 
                                                    src={images[product.imageId]?.filePath || 'https://placehold.co/600x400.png'} 
                                                    alt={product.name} 
                                                    fill 
                                                    objectFit="cover" 
                                                    className="rounded-t-lg" 
                                                    data-ai-hint="pizza food" />
                                            </div>
                                        </CardContent>
                                        <div className="p-4 flex-grow flex flex-col">
                                            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                            <p className="text-muted-foreground text-sm mb-4 flex-grow">{product.description}</p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                                                <Button onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}>
                                                    Adicionar
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )
                })}
            </main>
             {cart.length > 0 && (
                <footer className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
                     <Dialog open={isCartDialogOpen} onOpenChange={setIsCartDialogOpen}>
                        <div className="container mx-auto flex justify-between items-center">
                            <DialogTrigger asChild>
                                <Button size="lg" className="w-full sm:w-auto">
                                    <ShoppingCart className="mr-2" />
                                    Ver Carrinho ({cart.length})
                                </Button>
                            </DialogTrigger>
                            <div className="text-right hidden sm:block">
                                <p className="text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalCartPrice)}</p>
                            </div>
                        </div>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Seu Pedido</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[60vh] overflow-y-auto p-1 -mr-4 pr-4 space-y-4">
                                {cart.length === 0 ? (
                                     <p className="text-muted-foreground text-center py-8">Seu carrinho está vazio.</p>
                                ) : (
                                <div>
                                    {cart.map((item, index) => (
                                        <div key={index} className="mb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">{item.quantity}x {item.product.name}</h4>
                                                    {item.selectedAddons.length > 0 && (
                                                        <ul className="text-sm text-muted-foreground list-disc pl-5">
                                                            {item.selectedAddons.map(addon => <li key={addon.id}>{addon.name}</li>)}
                                                        </ul>
                                                    )}
                                                </div>
                                                <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                                            </div>
                                        <Separator className="my-2" />
                                        </div>
                                    ))}
                                </div>
                                )}
                                <div className="space-y-4">
                                     <Separator />
                                     <div>
                                        <h3 className="text-lg font-semibold mb-2">Dados para {restaurant?.delivery ? 'Entrega' : 'Retirada'}</h3>
                                        <div className="space-y-2">
                                             <Label htmlFor="customer-name">Seu Nome</Label>
                                             <Input 
                                                id="customer-name"
                                                placeholder="Digite seu nome completo" 
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                            />
                                            {restaurant?.delivery && (
                                             <>
                                             <Label htmlFor="address">Endereço Completo</Label>
                                             <Textarea 
                                                id="address" 
                                                placeholder="Ex: Rua das Flores, 123, Bairro, Cidade - SP, 01234-567" 
                                                value={deliveryAddress}
                                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                             />
                                             </>
                                            )}
                                        </div>
                                     </div>
                                     <div>
                                        <h3 className="text-lg font-semibold mb-2">Forma de Pagamento</h3>
                                         <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="card" id="card" />
                                                <Label htmlFor="card">Cartão de Crédito/Débito</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="pix" id="pix" />
                                                <Label htmlFor="pix">PIX</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="cash" id="cash" />
                                                <Label htmlFor="cash">Dinheiro</Label>
                                            </div>
                                        </RadioGroup>
                                        {paymentMethod === 'cash' && (
                                            <div className="mt-4 space-y-2">
                                                <Label htmlFor="change">Precisa de troco? Para quanto?</Label>
                                                <Input 
                                                    id="change" 
                                                    placeholder="Ex: R$ 50,00"
                                                    value={changeFor}
                                                    onChange={(e) => setChangeFor(e.target.value)}
                                                />
                                            </div>
                                        )}
                                     </div>
                                </div>
                            </div>
                            <DialogFooter className="flex-col !justify-start items-stretch gap-4 pt-4 border-t">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(totalCartPrice)}</span>
                                </div>
                                <Button 
                                    size="lg" 
                                    className="w-full bg-green-500 hover:bg-green-600" 
                                    onClick={sendOrderToWhatsApp} 
                                    disabled={cart.length === 0 || !customerName || (restaurant?.delivery && !deliveryAddress) || !paymentMethod || !isRestaurantOpen}
                                >
                                    <ShoppingCart className="mr-2" />
                                    {isRestaurantOpen ? 'Finalizar Pedido no WhatsApp' : 'Restaurante Fechado'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </footer>
            )}
        </div>

        <DialogContent className="sm:max-w-md">
            {selectedProduct && (
            <>
                <DialogHeader>
                    <div className="relative h-48 w-full -mx-6 -mt-6 mb-4">
                        <Image 
                          src={images[selectedProduct.imageId]?.filePath || 'https://placehold.co/600x400.png'} 
                          alt={selectedProduct.name} 
                          fill 
                          objectFit="cover" 
                          className="rounded-t-lg" 
                          data-ai-hint="pizza food"/>
                    </div>
                    <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                    <DialogDescription>{selectedProduct.description}</DialogDescription>
                </DialogHeader>
                
                {getAddonsForProduct(selectedProduct).length > 0 && (
                    <div className="my-4">
                        <h4 className="font-semibold mb-2">Adicionais</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                            {getAddonsForProduct(selectedProduct).map(addon => (
                                <div key={addon.id} className="flex items-center justify-between p-2 rounded-md border">
                                    <div>
                                        <Label htmlFor={`addon-${addon.id}`}>{addon.name}</Label>
                                        <p className="text-sm text-primary">+{formatCurrency(addon.price)}</p>
                                    </div>
                                    <Checkbox 
                                        id={`addon-${addon.id}`} 
                                        onCheckedChange={(checked) => handleAddonToggle(addon, !!checked)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between my-4">
                    <h4 className="font-semibold">Quantidade</h4>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                        <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button className="w-full" size="lg" onClick={addToCart}>
                        Adicionar ao carrinho - {formatCurrency(calculateItemPrice())}
                    </Button>
                </DialogFooter>
            </>
            )}
        </DialogContent>
    </Dialog>
    );
}

    