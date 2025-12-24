import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TicketHeaderClient } from '@/components/tickets/ticket-header-client';
import { TicketTimelineClient } from '@/components/tickets/ticket-timeline-client';
import { TicketMessageFormClient } from '@/components/tickets/ticket-message-form-client';
import { readItem, readItems } from '@directus/sdk';
import { directusServer } from '@/lib/directus';
import { TicketWithMessages } from '@/types/tickets';

async function getClientTicket(
  ticketId: string,
  userId: string
): Promise<TicketWithMessages | null> {
  try {
    // Obtener cuenta del usuario
    const accountMembers = await directusServer.request(
      readItems('account_members', {
        filter: {
          user: { _eq: userId },
        },
        fields: ['id', { account: ['id'] }],
        limit: 1,
      })
    );

    if (!accountMembers || accountMembers.length === 0) {
      return null;
    }

    const accountId = (accountMembers[0].account as any).id;

    // Obtener ticket
    const ticket = await directusServer.request(
      readItem('tickets', ticketId, {
        fields: [
          '*',
          {
            account: ['id', 'name'],
            status: ['id', 'key', 'label'],
            priority: ['id', 'key', 'label'],
            category: ['id', 'label'],
            assigned_to: ['first_name', 'last_name'],
          },
        ],
      })
    );

    // Verificar que el ticket pertenece a la cuenta del usuario
    if ((ticket.account as any)?.id !== accountId) {
      return null;
    }

    // Obtener mensajes (solo los no internos)
    const messages = await directusServer.request(
      readItems('tickets_messages', {
        filter: {
          _and: [
            { ticket: { _eq: ticketId } },
            { is_internal: { _eq: false } },
          ],
        },
        fields: ['*', { author: ['id', 'first_name', 'last_name'] }],
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
    console.error('Error fetching client ticket:', error);
    return null;
  }
}

export default async function ClientTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;
  const ticket = await getClientTicket(id, session.user.id);

  if (!ticket) {
    notFound();
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

      {/* Header con info del ticket */}
      <TicketHeaderClient ticket={ticket} />

      {/* Timeline de mensajes */}
      <div className="grid gap-6">
        <TicketTimelineClient ticket={ticket} currentUserId={session.user.id} />

        {/* Formulario para nuevo mensaje (solo si no está cerrado) */}
        {ticket.status.key !== 'closed' && (
          <TicketMessageFormClient ticketId={ticket.id} />
        )}
      </div>
    </div>
  );
}