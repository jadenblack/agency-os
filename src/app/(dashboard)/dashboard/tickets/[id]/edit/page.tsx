import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TicketForm } from '@/components/tickets/ticket-form';
import { auth } from '@/lib/auth';
import { directusServer } from '@/lib/directus';
import { readItem } from '@directus/sdk';
import { Ticket } from '@/types/tickets';

async function getTicket(id: string): Promise<Ticket | null> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const ticket = await directusServer.request(
      readItem('tickets', id, {
        fields: [
          '*',
          {
            account: ['id', 'name'],
            assigned_to: ['id', 'first_name', 'last_name'],
            status: ['id', 'key', 'label'],
            priority: ['id', 'key', 'label'],
            category: ['id', 'key', 'label'],
            requester_contact: ['id', 'first_name', 'last_name'],
            package: ['id', 'name', 'code'],
          },
        ],
      })
    );

    return ticket as Ticket;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return null;
  }
}

export default async function EditTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicket(id);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/tickets/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Ticket
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Editar Ticket</h1>
        <p className="text-muted-foreground mt-1">{ticket.subject}</p>
      </div>

      {/* Form */}
      <TicketForm ticket={ticket} />
    </div>
  );
}