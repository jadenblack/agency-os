import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ClientHeader from '@/components/client-portal/client-header';

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Verificar que el usuario sea un cliente
  const isClient = session.user?.role === 'Cliente';

  if (!isClient) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader 
        userName={session.user?.name} 
        userEmail={session.user?.email} 
      />

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