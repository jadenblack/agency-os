import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Ticket, BookOpen } from 'lucide-react';
import { signOut } from '@/lib/auth';

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

    // DEBUG - Ver qué rol tiene exactamente
  console.log('Session user role:', session.user?.role);
  console.log('Session user role type:', typeof session.user?.role);
  console.log('Full session user:', JSON.stringify(session.user));

  // Verificar que el usuario sea un cliente
  const isClient = session.user?.role === 'Cliente'; // ← CAMBIADO

  if (!isClient) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                {session.user?.name || session.user?.email}
              </span>
              <form action="/api/auth/signout" method="POST">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Tu Agencia. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}