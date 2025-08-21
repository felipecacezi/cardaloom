
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-4">
            <Link href="/login">
                <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/signup">
                <Button>Comece Agora</Button>
            </Link>
        </div>
      </div>
    </header>
  );
}
