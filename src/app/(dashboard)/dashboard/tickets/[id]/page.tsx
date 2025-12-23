import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { TicketHeader } from '@/components/tickets/ticket-header';
import { TicketTimeline } from '@/components/tickets/ticket-timeline';
import { TicketMessageForm } from '@/components/tickets/ticket-message-form';
import { auth } from '@/lib/auth';
import { createDirectus, rest, readItem, readItems, authentication } from '@directus/sdk';
import { TicketWithMessages } from '@/types/tickets';

async function getTicket(id: string): Promise<TicketWithMessages | null> {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return null;
    }

    const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(authentication('json'))
      .with(rest());

    await directus.setToken(session.accessToken);

    // Obtener ticket
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
          'requester_contact.email',
          'package.id',
          'package.name',
          'package.code',
        ],
      })
    );

    // Obtener mensajes del ticket
    const messages = await directus.request(
      readItems('tickets_messages', {
        filter: {
          ticket: { _eq: id },
        },
        fields: [
          '*',
          'author.id',
          'author.first_name',
          'author.last_name',
        ],
        sort: ['date_created'],
        limit: -1,
      })
    );

    return {
      ...ticket,
      messages,
    } as TicketWithMessages;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return null;
  }
}

export default async function TicketDetailPage({
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
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/tickets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Tickets
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/dashboard/tickets/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Header con info del ticket */}
      <TicketHeader ticket={ticket} />

      {/* Timeline de mensajes */}
      <div className="grid gap-6">
        <TicketTimeline ticket={ticket} />
        
        {/* Formulario para nuevo mensaje */}
        <TicketMessageForm ticketId={ticket.id} />
      </div>
    </div>
  );
}