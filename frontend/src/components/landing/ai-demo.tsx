'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestProductDescription, SuggestProductDescriptionInput } from '@/ai/flows/suggest-product-descriptions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  productName: z.string().min(2, { message: 'O nome do produto deve ter pelo menos 2 caracteres.' }),
  productCategory: z.string().min(2, { message: 'A categoria deve ter pelo menos 2 caracteres.' }),
  ingredients: z.string().min(10, { message: 'Liste pelo menos alguns ingredientes (mínimo 10 caracteres).' }),
});

export default function AiDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      productCategory: '',
      ingredients: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setDescription('');
    try {
      const result = await suggestProductDescription(values as SuggestProductDescriptionInput);
      setDescription(result.description);
    } catch (error) {
      console.error("Error generating description:", error);
      setDescription('Ocorreu um erro ao gerar a descrição. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="py-20 sm:py-32 bg-muted/50">
      <div className="container grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Descrições que vendem, <span className="text-primary">criadas por IA.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cansado de pensar em textos criativos? Deixe nossa inteligência artificial fazer o trabalho pesado. Teste agora e veja a mágica acontecer.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Prato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pizza Margherita" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pizzas Tradicionais" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Principais Ingredientes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Molho de tomate, mussarela fresca, manjericão" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Descrição
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
        <div className="flex items-center justify-center">
          <Card className="w-full lg:max-w-md min-h-[250px] flex flex-col">
            <CardHeader>
              <CardTitle>Descrição Sugerida</CardTitle>
              <CardDescription>Esta é a sugestão da nossa IA.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {description || 'Preencha os campos e clique em gerar para ver o resultado aqui.'}
                </p>
              )}
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">✨ Criado com a magia da IA</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
