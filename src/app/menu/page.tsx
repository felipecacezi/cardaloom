
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ShoppingCart, Clock } from 'lucide-react';
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
  operatingHours: {
    monday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
    tuesday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
    wednesday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
    thursday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
    friday: { isOpen: true, openTime: '18:00', closeTime: '00:00' },
    saturday: { isOpen: true, openTime: '12:00', closeTime: '00:00' },
    sunday: { isOpen: false, openTime: '', closeTime: '' },
  }
};

const weekDayLabels: Record<string, string> = {
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

const categories = [
  { id: 1, name: 'Pizzas Salgadas' },
  { id: 2, name: 'Pizzas Doces' },
  { id: 3, name: 'Bebidas' },
  { id: 4, name: 'Sobremesas' },
];

const products = [
    { id: 1, name: 'Pizza Margherita', price: 45.00, description: 'Molho de tomate, mussarela fresca e manjericão.', category: 'Pizzas Salgadas', image: 'https://placehold.co/600x400.png', addons: [{ id: 1, name: 'Borda Recheada Catupiry', price: 8.00 }], isVisible: true },
    { id: 2, name: 'Pizza Calabresa', price: 48.50, description: 'Molho de tomate, mussarela, calabresa e cebola.', category: 'Pizzas Salgadas', image: 'https://placehold.co/600x400.png', addons: [{ id: 1, name: 'Borda Recheada Catupiry', price: 8.00 }, { id: 3, name: 'Bacon Extra', price: 6.50 }], isVisible: true },
    { id: 3, name: 'Pizza Quatro Queijos', price: 52.00, description: 'Molho de tomate, mussarela, provolone, parmesão e gorgonzola.', category: 'Pizzas Salgadas', image: 'https://placehold.co/600x400.png', addons: [{ id: 1, name: 'Borda Recheada Catupiry', price: 8.00 }, { id: 2, name: 'Borda Recheada Cheddar', price: 8.00 }], isVisible: true },
    { id: 4, name: 'Pizza Portuguesa', price: 50.00, description: 'Molho, mussarela, presunto, ovo, cebola, pimentão e azeitona.', category: 'Pizzas Salgadas', image: 'https://placehold.co/600x400.png', addons: [{id: 6, name: 'Ovo', price: 3.00}], isVisible: true },
    { id: 5, name: 'Pizza Frango com Catupiry', price: 51.00, description: 'Molho de tomate, frango desfiado coberto com Catupiry.', category: 'Pizzas Salgadas', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 13, name: 'Pizza Pepperoni', price: 53.00, description: 'Molho de tomate, mussarela e fatias de pepperoni.', category: 'Pizzas Salgadas', image: 'https://placehold.co/600x400.png', addons: [{ id: 1, name: 'Borda Recheada Catupiry', price: 8.00 }], isVisible: true },
    { id: 14, name: 'Pizza Vegetariana', price: 49.00, description: 'Molho de tomate, mussarela, brócolis, palmito, champignon e tomate.', category: 'Pizzas Salgadas', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 6, name: 'Pizza de Chocolate com Morango', price: 42.00, description: 'Deliciosa pizza doce com chocolate ao leite e morangos frescos.', category: 'Pizzas Doces', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 7, name: 'Pizza Romeu e Julieta', price: 40.00, description: 'Mussarela derretida com uma generosa camada de goiabada.', category: 'Pizzas Doces', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 15, name: 'Pizza Banana com Canela', price: 38.00, description: 'Banana fatiada com açúcar e canela sobre uma base de mussarela.', category: 'Pizzas Doces', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 8, name: 'Coca-Cola 2L', price: 10.00, description: 'Refrigerante gelado para acompanhar sua pizza.', category: 'Bebidas', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 9, name: 'Guaraná Antarctica 2L', price: 10.00, description: 'O sabor original do Brasil, bem gelado.', category: 'Bebidas', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 10, name: 'Água Mineral sem Gás 500ml', price: 4.00, description: 'Para se manter hidratado.', category: 'Bebidas', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 16, name: 'Suco de Laranja Natural 500ml', price: 8.00, description: 'Feito com laranjas frescas espremidas na hora.', category: 'Bebidas', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 11, name: 'Pudim de Leite Condensado', price: 8.00, description: 'A sobremesa clássica que todo mundo ama.', category: 'Sobremesas', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 12, name: 'Mousse de Maracujá', price: 9.00, description: 'Azedinho e doce na medida certa.', category: 'Sobremesas', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
    { id: 17, name: 'Torta Holandesa (fatia)', price: 12.00, description: 'Uma fatia generosa da famosa torta com base de biscoito e creme.', category: 'Sobremesas', image: 'https://placehold.co/600x400.png', addons: [], isVisible: true },
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
    const [isOperatingHoursOpen, setIsOperatingHoursOpen] = useState(false);


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
                    <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">{restaurant.name}</h1>
                     <div className="flex items-center gap-4 mt-2">
                        {restaurant.isOpen ? (
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
                                    {Object.entries(restaurant.operatingHours).map(([day, hours]) => (
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
                {categories.map(category => (
                    <section key={category.id} id={`category-${category.id}`} className="mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-6">{category.name}</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.filter(p => p.category === category.name && p.isVisible).map(product => (
                                <Card key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col">
                                    <CardHeader className="p-0">
                                        <div className="relative h-48 w-full">
                                            <Image src={product.image} alt={product.name} fill objectFit="cover" className="rounded-t-lg" data-ai-hint="pizza food" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 flex-grow flex flex-col">
                                        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                        <p className="text-muted-foreground text-sm mb-4 flex-grow">{product.description}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                                            <Button onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}>
                                                Adicionar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                ))}
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
                                <DialogTitle>Seu Carrinho</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[60vh] overflow-y-auto p-1 -mr-4 pr-4">
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
                                {cart.length === 0 && <p className="text-muted-foreground text-center py-8">Seu carrinho está vazio.</p>}
                            </div>
                            <DialogFooter className="flex-col !justify-start items-stretch gap-4 pt-4 border-t">
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
                    <div className="relative h-48 w-full -mx-6 -mt-6 mb-4">
                        <Image src={selectedProduct.image} alt={selectedProduct.name} fill objectFit="cover" className="rounded-t-lg" data-ai-hint="pizza food"/>
                    </div>
                    <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                    <DialogDescription>{selectedProduct.description}</DialogDescription>
                </DialogHeader>
                
                {selectedProduct.addons && selectedProduct.addons.length > 0 && (
                    <div className="my-4">
                        <h4 className="font-semibold mb-2">Adicionais</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
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

    