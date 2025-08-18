
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
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

// Mock data (replace with actual data fetching)
const restaurant = {
  name: 'Cantina da Mama',
  isOpen: true, // This could be calculated based on operating hours
};

const categories = [
  { id: 1, name: 'Pizzas Salgadas' },
  { id: 2, name: 'Pizzas Doces' },
  { id: 3, name: 'Bebidas' },
];

const products = [
    { id: 1, name: 'Pizza Margherita', price: 45.00, description: 'Molho de tomate, mussarela fresca e manjericão.', category: 'Pizzas Salgadas', image: 'https://placehold.co/600x400.png', addons: [{ id: 1, name: 'Borda Recheada Catupiry', price: 8.00 }], isVisible: true },
    { id: 2, name: 'Pizza Calabresa', price: 48.50, description: 'Molho de tomate, mussarela, calabresa e cebola.', category: 'Pizzas Salgadas', image: 'https://placehold.co/600x400.png', addons: [{ id: 1, name: 'Borda Recheada Catupiry', price: 8.00 }, { id: 3, name: 'Bacon Extra', price: 6.50 }], isVisible: true },
    { id: 3, name: 'Pizza Quatro Queijos', price: 52.00, description: 'Molho de tomate, mussarela, provolone, parmesão e gorgonzola.', category: 'Pizzas Salgadas', image: 'https://placehold.co/600x400.png', addons: [{ id: 1, name: 'Borda Recheada Catupiry', price: 8.00 }, { id: 2, name: 'Borda Recheada Cheddar', price: 8.00 }], isVisible: true },
    { id: 4, name: 'Pizza de Chocolate', price: 40.00, description: 'Chocolate ao leite com morangos frescos.', category: 'Pizzas Doces', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 5, name: 'Coca-Cola 2L', price: 10.00, description: 'Refrigerante gelado para acompanhar sua pizza.', category: 'Bebidas', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
];

type Addon = { id: number; name: string; price: number; };
type Product = typeof products[0];
type CartItem = {
    product: Product;
    quantity: number;
    selectedAddons: Addon[];
    totalPrice: number;
}


const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function MenuPage() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);

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

    return (
    <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <div className="min-h-screen bg-muted/20">
            <header className="bg-background shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-primary">{restaurant.name}</h1>
                    {restaurant.isOpen ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Aberto</Badge>
                    ) : (
                        <Badge variant="destructive">Fechado</Badge>
                    )}
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {categories.map(category => (
                    <section key={category.id} id={`category-${category.id}`} className="mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-6">{category.name}</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.filter(p => p.category === category.name && p.isVisible).map(product => (
                                <DialogTrigger key={product.id} asChild>
                                    <Card onClick={() => handleProductClick(product)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col">
                                        <CardHeader className="p-0">
                                            <div className="relative h-48 w-full">
                                                <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint="pizza food" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 flex-grow flex flex-col">
                                            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                            <p className="text-muted-foreground text-sm mb-4 flex-grow">{product.description}</p>
                                            <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                                        </CardContent>
                                    </Card>
                                </DialogTrigger>
                            ))}
                        </div>
                    </section>
                ))}
            </main>
             {cart.length > 0 && (
                <footer className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
                     <Dialog open={isCartDialogOpen} onOpenChange={setIsCartDialogOpen}>
                        <div className="container mx-auto flex justify-between items-center">
                        <DialogTrigger asChild>
                                <Button size="lg">
                                    <ShoppingCart className="mr-2" />
                                    Ver Carrinho ({cart.length})
                                </Button>
                            </DialogTrigger>
                            <div className="text-right">
                                <p className="text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalCartPrice)}</p>
                            </div>
                        </div>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Seu Carrinho</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[60vh] overflow-y-auto p-1">
                                {cart.map((item, index) => (
                                    <div key={index} className="mb-4">
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
                            <DialogFooter className="flex-col !justify-start items-stretch gap-4">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(totalCartPrice)}</span>
                                </div>
                                <Button size="lg" className="w-full bg-green-500 hover:bg-green-600">
                                    <ShoppingCart className="mr-2" />
                                    Finalizar Pedido no WhatsApp
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
                    <div className="relative h-48 w-full mb-4">
                        <Image src={selectedProduct.image} alt={selectedProduct.name} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint="pizza food"/>
                    </div>
                    <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                    <DialogDescription>{selectedProduct.description}</DialogDescription>
                </DialogHeader>
                
                {selectedProduct.addons.length > 0 && (
                    <div className="my-4">
                        <h4 className="font-semibold mb-2">Adicionais</h4>
                        <div className="space-y-2">
                            {selectedProduct.addons.map(addon => (
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

    