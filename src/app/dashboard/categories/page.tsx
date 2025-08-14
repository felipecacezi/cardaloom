
'use client';

import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
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


const categories = [
  { name: 'Pizzas Salgadas', description: 'As melhores pizzas com ingredientes frescos e selecionados.' },
  { name: 'Pizzas Doces', description: 'Combinações surpreendentes para adoçar o seu paladar.' },
  { name: 'Bebidas', description: 'Refrigerantes, sucos naturais, cervejas e águas.' },
  { name: 'Sobremesas', description: 'Deliciosas sobremesas caseiras para finalizar com chave de ouro.' },
  { name: 'Entradas e Porções', description: 'Aperitivos perfeitos para começar ou compartilhar.' },
  { name: 'Combos Especiais', description: 'Ofertas imperdíveis para toda a família e amigos.' },
  { name: 'Lanches', description: 'Sanduíches e hambúrgueres artesanais.' },
  { name: 'Opções Vegetarianas', description: 'Pratos deliciosos sem carne.' },
  { name: 'Saladas', description: 'Opções leves e saudáveis.' },
  { name: 'Massas', description: 'Receitas italianas clássicas e da casa.' },
];

export default function CategoriesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Gerenciar Categorias</h1>
          <p className="text-sm text-muted-foreground">Adicione, edite ou remova as categorias do seu cardápio.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          Nova Categoria
        </Button>
      </header>
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
             <CardTitle>Suas Categorias</CardTitle>
            <CardDescription>Visualize e gerencie todas as suas categorias cadastradas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCategories.map((category) => (
                  <TableRow key={category.name}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
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
              Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, categories.length)} de {categories.length} categorias.
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
      </main>
    </>
  );
}
