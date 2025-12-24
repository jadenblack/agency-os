import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { TicketHeader } from '@/components/tickets/ticket-header';
import { TicketTimeline } from '@/components/tickets/ticket-timeline';
import { TicketMessageForm } from '@/components/tickets/ticket-message-form';
import { auth } from '@/lib/auth';
import { directusServer } from '@/lib/directus';
import { readItem, readItems } from '@directus/sdk';
import { TicketWithMessages } from '@/types/tickets';

async function getTicket(id: string): Promise<TicketWithMessages | null> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    // Obtener ticket
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
            requester_contact: ['id', 'first_name', 'last_name', 'email'],
            package: ['id', 'name', 'code'],
          },
        ],
      })
    );

    // Obtener mensajes del ticket con archivos
    const messages = await directusServer.request(
      readItems('tickets_messages', {
        filter: {
          ticket: { _eq: id },
        },
        fields: [
          '*',
          {
            author: ['id', 'first_name', 'last_name'],
          },
        ],
        sort: ['date_created'],
        limit: -1,
      })
    );

    // Obtener archivos de cada mensaje
    const messagesWithFiles = await Promise.all(
      messages.map(async (message) => {
        const files = await directusServer.request(
          readItems('ticket_message_files', {
            filter: {
              ticket_message: { _eq: message.id },
            },
            fields: [
              'id',
              'sort',
              'date_created',
              {
                file: [
                  'id',
                  'filename_download',
                  'type',
                  'filesize',
                  'title',
                ],
              },
            ],
            sort: ['sort'],
          })
        );

        return {
          ...message,
          files,
        };
      })
    );

    return {
      ...ticket,
      messages: messagesWithFiles,
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
  const session = await auth();
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
        <TicketTimeline ticket={ticket} currentUserId={session?.user?.id} />
        
        {/* Formulario para nuevo mensaje */}
        <TicketMessageForm ticketId={ticket.id} />
      </div>
    </div>
  );
}