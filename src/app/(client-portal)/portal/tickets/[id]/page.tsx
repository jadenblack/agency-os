import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TicketHeaderClient } from '@/components/tickets/ticket-header-client';
import { TicketTimelineClient } from '@/components/tickets/ticket-timeline-client';
import { TicketMessageFormClient } from '@/components/tickets/ticket-message-form-client';
import { createDirectus, rest, readItem, readItems, authentication } from '@directus/sdk';
import { TicketWithMessages } from '@/types/tickets';

async function getClientTicket(
  ticketId: string,
  userId: string
): Promise<TicketWithMessages | null> {
  try {
    const session = await auth();
    if (!session?.accessToken) return null;

    const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(authentication('json'))
      .with(rest());

    await directus.setToken(session.accessToken);

    // Obtener cuenta del usuario
    const accountMembers = await directus.request(
      readItems('account_members', {
        filter: {
          user: { _eq: userId },
        },
        fields: ['account.id'],
        limit: 1,
      })
    );

    if (!accountMembers || accountMembers.length === 0) {
      return null;
    }

    const accountId = (accountMembers[0].account as any).id;

    // Obtener ticket
    const ticket = await directus.request(
      readItem('tickets', ticketId, {
        fields: [
          '*',
          'account.id',
          'account.name',
          'status.id',
          'status.key',
          'status.label',
          'priority.id',
          'priority.key',
          'priority.label',
          'category.id',
          'category.label',
          'assigned_to.first_name',
          'assigned_to.last_name',
        ],
      })
    );

    // Verificar que el ticket pertenece a la cuenta del usuario
    if ((ticket.account as any)?.id !== accountId) {
      return null;
    }

    // Obtener mensajes (solo los no internos)
    const messages = await directus.request(
      readItems('tickets_messages', {
        filter: {
          _and: [
            { ticket: { _eq: ticketId } },
            { is_internal: { _eq: false } },
          ],
        },
        fields: ['*', 'author.id', 'author.first_name', 'author.last_name'],
        sort: ['date_created'],
        limit: -1,
      })
    );

    return {
      ...ticket,
      messages,
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
        <TicketTimelineClient ticket={ticket} />

        {/* Formulario para nuevo mensaje (solo si no está cerrado) */}
        {ticket.status.key !== 'closed' && (
          <TicketMessageFormClient ticketId={ticket.id} />
        )}
      </div>
    </div>
  );
}