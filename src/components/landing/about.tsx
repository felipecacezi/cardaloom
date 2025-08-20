import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-32 bg-muted/50">
      <div className="container grid lg:grid-cols-2 gap-12 items-center">
        <div className="p-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nossa História</h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              A Cardaloom nasceu da paixão de dois amigos por tecnologia e da vontade de fazer a diferença. Há cerca de dois anos, percebemos que donos de restaurantes, lanchonetes e pizzarias, dos grandes aos mais simples, enfrentavam os mesmos desafios: taxas abusivas em aplicativos de delivery e a dificuldade de expor seus pratos na internet.
            </p>
            <p>
              Decidimos criar uma solução que devolvesse o controle aos verdadeiros protagonistas: vocês. Nossa missão é oferecer uma ferramenta poderosa e acessível, que não apenas simplifica a criação de um cardápio digital, mas também impulsiona suas vendas e conecta seu negócio a mais clientes, sem complicações e sem morder uma fatia do seu lucro.
            </p>
            <p>
                Acreditamos que a boa comida merece ser descoberta, e estamos aqui para ajudar isso a acontecer.
            </p>
          </div>
        </div>
        <div className="relative h-80">
          <Image
            src="https://placehold.co/600x400.png"
            alt="Dois desenvolvedores colaborando em um projeto"
            fill
            className="object-contain"
            data-ai-hint="collaboration startup"
          />
        </div>
      </div>
    </section>
  );
}
