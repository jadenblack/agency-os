import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TicketFormClient } from '@/components/tickets/ticket-form-client';

export default async function NewClientTicketPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/portal/tickets">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Mis Tickets
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Nuevo Ticket</h1>
        <p className="text-muted-foreground mt-1">
          Describe tu problema o consulta y nuestro equipo te ayudará
        </p>
      </div>

      {/* Form */}
      <TicketFormClient userId={session.user.id} />
    </div>
  );
}