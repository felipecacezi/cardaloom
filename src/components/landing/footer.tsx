
'use client';

import * as React from 'react';
import { Logo } from '@/components/logo';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from '../ui/scroll-area';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Transformando a maneira como restaurantes apresentam seus pratos.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div>
              <h4 className="font-semibold mb-3">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary">Funcionalidades</Link></li>
                <li><Link href="#pricing" className="hover:text-primary">Preços</Link></li>
                <li><a href="#" className="hover:text-primary">Exemplos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#about" className="hover:text-primary">Sobre nós</Link></li>
                <li><a href="#" className="hover:text-primary">Carreiras</a></li>
                <li><Link href="#contact" className="hover:text-primary">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li>
                   <Dialog>
                      <DialogTrigger asChild>
                         <button className="hover:text-primary">Termos de Serviço</button>
                      </DialogTrigger>
                       <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Termos de Serviço</DialogTitle>
                          <DialogDescription>
                            Última atualização: {new Date().toLocaleDateString('pt-BR')}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-6">
                          <div className="space-y-4 text-sm text-muted-foreground">
                             <h3 className="font-semibold text-foreground">1. Aceitação dos Termos</h3>
                            <p>Ao acessar e usar a plataforma Cardaloom ("Serviço"), você concorda em cumprir e estar sujeito a estes Termos de Serviço. Se você não concorda com estes termos, não use o Serviço.</p>

                            <h3 className="font-semibold text-foreground">2. Descrição do Serviço</h3>
                            <p>A Cardaloom fornece uma plataforma para que restaurantes e estabelecimentos similares ("Clientes") criem, gerenciem e compartilhem cardápios digitais. O serviço inclui, mas não se limita a, hospedagem de cardápios, ferramentas de personalização e integração com pedidos via WhatsApp.</p>

                            <h3 className="font-semibold text-foreground">3. Contas de Usuário</h3>
                            <p>Para acessar certas funcionalidades, você deve criar uma conta. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta. Você concorda em nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.</p>

                            <h3 className="font-semibold text-foreground">4. Conteúdo do Cliente</h3>
                            <p>Você retém todos os direitos sobre o conteúdo que carrega na plataforma, incluindo nomes de produtos, descrições, preços e imagens ("Conteúdo do Cliente"). Ao carregar o Conteúdo do Cliente, você nos concede uma licença mundial, não exclusiva e isenta de royalties para hospedar, exibir e distribuir seu conteúdo exclusivamente com o propósito de operar e promover o Serviço.</p>

                            <h3 className="font-semibold text-foreground">5. Uso Aceitável</h3>
                            <p>Você concorda em não usar o Serviço para qualquer finalidade ilegal ou proibida por estes Termos. Você não pode usar o Serviço de qualquer maneira que possa danificar, desabilitar, sobrecarregar ou prejudicar nossos servidores ou redes.</p>

                            <h3 className="font-semibold text-foreground">6. Pagamentos e Assinaturas</h3>
                            <p>Oferecemos planos de assinatura pagos. As taxas de assinatura são cobradas mensal ou anualmente, conforme o plano selecionado. Todas as taxas não são reembolsáveis, exceto conforme exigido por lei. Nos reservamos o direito de alterar nossas taxas a qualquer momento, com aviso prévio.</p>

                            <h3 className="font-semibold text-foreground">7. Limitação de Responsabilidade</h3>
                            <p>Em nenhuma circunstância a Cardaloom será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da incapacidade de usar o Serviço.</p>

                            <h3 className="font-semibold text-foreground">8. Alterações nos Termos</h3>
                            <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos sobre quaisquer alterações, publicando os novos Termos de Serviço nesta página. O uso continuado do Serviço após tais alterações constitui sua aceitação dos novos Termos.</p>

                             <h3 className="font-semibold text-foreground">9. Contato</h3>
                            <p>Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através da seção "Fale Conosco" em nosso site.</p>
                          </div>
                        </ScrollArea>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button">Fechar</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </li>
                  <li>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="hover:text-primary">Política de Privacidade</button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Política de Privacidade</DialogTitle>
                          <DialogDescription>
                             Última atualização: {new Date().toLocaleDateString('pt-BR')}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-6">
                           <div className="space-y-4 text-sm text-muted-foreground">
                                <h3 className="font-semibold text-foreground">1. Informações que Coletamos</h3>
                                <p>Coletamos informações que você nos fornece diretamente, como nome, e-mail e informações do seu negócio ao criar uma conta. Também coletamos informações automaticamente, como seu endereço IP e dados de uso do serviço.</p>

                                <h3 className="font-semibold text-foreground">2. Como Usamos Suas Informações</h3>
                                <p>Utilizamos suas informações para operar, manter e melhorar nossos serviços, para processar pagamentos, para nos comunicarmos com você e para fins de segurança.</p>

                                <h3 className="font-semibold text-foreground">3. Compartilhamento de Informações</h3>
                                <p>Não compartilhamos suas informações pessoais com terceiros, exceto para cumprir a lei, proteger nossos direitos ou com provedores de serviços que nos auxiliam a operar (como processadores de pagamento), os quais são obrigados a manter a confidencialidade.</p>

                                <h3 className="font-semibold text-foreground">4. Segurança de Dados</h3>
                                <p>Empregamos medidas de segurança para proteger suas informações contra acesso, alteração, divulgação ou destruição não autorizada. No entanto, nenhum sistema é 100% seguro.</p>

                                <h3 className="font-semibold text-foreground">5. Seus Direitos</h3>
                                <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você pode fazer isso através das configurações da sua conta ou entrando em contato conosco.</p>
                                
                                <h3 className="font-semibold text-foreground">6. Cookies</h3>
                                <p>Utilizamos cookies para melhorar sua experiência. Cookies são pequenos arquivos de dados armazenados em seu dispositivo. Você pode configurar seu navegador para recusar cookies, mas algumas partes do serviço podem não funcionar corretamente.</p>

                                <h3 className="font-semibold text-foreground">7. Alterações nesta Política</h3>
                                <p>Podemos atualizar esta Política de Privacidade de tempos em tempos. Notificaremos sobre quaisquer alterações publicando a nova política nesta página.</p>
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button">Fechar</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Cardaloom. Todos os direitos reservados.
            </p>
            {/* <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary"><Twitter size={20} /></a>
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary"><Instagram size={20} /></a>
            </div> */}
          </div>
        </div>
      </footer>
  );
}
