import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { createDirectus, rest, readItems, authentication } from '@directus/sdk';
import { Ticket } from '@/types/tickets';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

async function getClientTickets(userId: string): Promise<Ticket[]> {
  try {
    const session = await auth();
    if (!session?.accessToken) return [];

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
      return [];
    }

    const accountId = (accountMembers[0].account as any).id;

    // Obtener tickets de la cuenta
    const tickets = await directus.request(
      readItems('tickets', {
        filter: {
          account: { _eq: accountId },
        },
        fields: [
          '*',
          'status.id',
          'status.key',
          'status.label',
          'priority.id',
          'priority.key',
          'priority.label',
          'category.id',
          'category.label',
        ],
        sort: ['-date_created'],
        limit: -1,
      })
    );

    return tickets as Ticket[];
  } catch (error) {
    console.error('Error fetching client tickets:', error);
    return [];
  }
}

function getStatusVariant(
  statusKey: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (statusKey) {
    case 'open':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'waiting_customer':
      return 'outline';
    case 'resolved':
      return 'default';
    case 'closed':
      return 'secondary';
    default:
      return 'default';
  }
}

function getPriorityVariant(
  priorityKey: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (priorityKey) {
    case 'low':
      return 'secondary';
    case 'medium':
      return 'default';
    case 'high':
      return 'outline';
    case 'urgent':
      return 'destructive';
    default:
      return 'default';
  }
}

export default async function ClientTicketsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const tickets = await getClientTickets(session.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus solicitudes de soporte
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ticket
          </Link>
        </Button>
      </div>

      {/* Tickets table */}
      {tickets.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            No tienes tickets aún. Crea uno para empezar.
          </p>
          <Button asChild className="mt-4">
            <Link href="/portal/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              Crear primer ticket
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asunto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Link
                      href={`/portal/tickets/${ticket.id}`}
                      className="font-medium hover:underline"
                    >
                      {ticket.subject}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(ticket.status.key || '')}>
                      {ticket.status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getPriorityVariant(ticket.priority.key || '')}
                    >
                      {ticket.priority.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ticket.date_created
                      ? formatDistanceToNow(new Date(ticket.date_created), {
                          addSuffix: true,
                          locale: es,
                        })
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}