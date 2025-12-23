import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TicketForm } from '@/components/tickets/ticket-form';
import { auth } from '@/lib/auth';
import { createDirectus, rest, readItem, authentication } from '@directus/sdk';
import { Ticket } from '@/types/tickets';

async function getTicket(id: string): Promise<Ticket | null> {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return null;
    }

    const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(authentication('json'))
      .with(rest());

    await directus.setToken(session.accessToken);

    const ticket = await directus.request(
      readItem('tickets', id, {
        fields: [
          '*',
          'account.id',
          'account.name',
          'assigned_to.id',
          'assigned_to.first_name',
          'assigned_to.last_name',
          'status.id',
          'status.key',
          'status.label',
          'priority.id',
          'priority.key',
          'priority.label',
          'category.id',
          'category.key',
          'category.label',
          'requester_contact.id',
          'requester_contact.first_name',
          'requester_contact.last_name',
          'package.id',
          'package.name',
          'package.code',
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