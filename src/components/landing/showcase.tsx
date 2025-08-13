'use client'
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const templates = [
  {
    src: "https://placehold.co/400x600.png",
    alt: "Modern menu template",
    hint: "modern menu"
  },
  {
    src: "https://placehold.co/400x600.png",
    alt: "Classic menu template",
    hint: "classic menu"
  },
  {
    src: "https://placehold.co/400x600.png",
    alt: "Minimalist menu template",
    hint: "minimalist menu"
  },
    {
    src: "https://placehold.co/400x600.png",
    alt: "Elegant menu template",
    hint: "elegant menu"
  },
];

export default function Showcase() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Um visual para cada gosto</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Escolha um template que combine com a personalidade do seu restaurante.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {templates.map((template, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <Image
                        src={template.src}
                        alt={template.alt}
                        width={400}
                        height={600}
                        className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                        data-ai-hint={template.hint}
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
