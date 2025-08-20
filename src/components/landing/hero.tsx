
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="container grid lg:grid-cols-2 gap-12 items-center py-20 sm:py-32">
      <div className="flex flex-col gap-6 text-center lg:text-left">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Seu cardápio digital, <span className="text-primary">visível para o mundo.</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Crie e compartilhe seu cardápio online de forma rápida e prática. Aumente sua visibilidade sem a burocracia dos aplicativos convencionais.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Link href="/signup">
            <Button size="lg">Criar meu cardápio grátis</Button>
          </Link>
          <Button size="lg" variant="outline">
            ver cardapios
          </Button>
        </div>
      </div>
      <div className="relative h-[300px] lg:h-[500px]">
        <Image
          src="/img/mock-cardapio2.png"
          alt="Exemplo de cardápio digital em um smartphone"
          fill
          className="object-contain rounded-xl shadow-lg"
          data-ai-hint="digital menu restaurant"
        />
      </div>
    </section>
  );
}
