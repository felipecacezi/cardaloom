import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit3, Share2, Languages, Rocket, LayoutTemplate } from 'lucide-react';

const features = [
  {
    icon: <Edit3 className="w-8 h-8 text-primary" />,
    title: 'Criação Simplificada',
    description: 'Adicione produtos, descrições e preços em minutos com nossa interface intuitiva.',
  },
  {
    icon: <Share2 className="w-8 h-8 text-primary" />,
    title: 'Compartilhamento Fácil',
    description: 'Divulgue seu cardápio em qualquer rede social com um link único e personalizável.',
  },
  {
    icon: <Rocket className="w-8 h-8 text-primary" />,
    title: 'Visibilidade Global',
    description: 'Seu cardápio acessível de qualquer lugar do mundo, a qualquer hora.',
  },
  {
    icon: <LayoutTemplate className="w-8 h-8 text-primary" />,
    title: 'Templates Prontos',
    description: 'Escolha entre diversos modelos de cardápio para combinar com a identidade do seu negócio.',
  },
  {
    icon: <Languages className="w-8 h-8 text-primary" />,
    title: 'Suporte Multilíngue',
    description: 'Traduza seu cardápio automaticamente para diversos idiomas e alcance mais clientes.',
  },
];


export default function Features() {
  return (
    <section className="py-20 sm:py-32 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tudo que você precisa para decolar</h2>
          <p className="mt-4 text-lg text-muted-foreground">Funcionalidades pensadas para simplificar sua vida e impressionar seus clientes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col items-center text-center p-6 bg-card hover:shadow-lg transition-shadow duration-300">
              <div className="p-4 bg-primary/10 rounded-full">
                {feature.icon}
              </div>
              <CardHeader className="p-0 mt-4">
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardDescription className="mt-2">{feature.description}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
