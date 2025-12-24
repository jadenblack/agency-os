'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Ticket, BookOpen } from 'lucide-react';

interface ClientHeaderProps {
  userName?: string | null;
  userEmail?: string;
}

export default function ClientHeader({ userName, userEmail }: ClientHeaderProps) {
  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/login',
      redirect: true 
    });
  };

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">Portal Cliente</h1>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/portal"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Inicio
              </Link>
              <Link
                href="/portal/tickets"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary"
              >
                <Ticket className="h-4 w-4" />
                Mis Tickets
              </Link>
              <Link
                href="/portal/knowledge-base"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary"
              >
                <BookOpen className="h-4 w-4" />
                Base de Conocimiento
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {userName || userEmail}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}