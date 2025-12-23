import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ticket } from '@/types/tickets';
import { directusServer } from '@/lib/directus';
import { readItems } from '@directus/sdk';

interface TicketsTableProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    assigned_to?: string;
    account?: string;
    search?: string;
  }>;
}

// Fetch tickets directamente desde Directus
async function getTickets(params: {
  status?: string;
  priority?: string;
  assigned_to?: string;
  account?: string;
  search?: string;
}) {
  // Construir filtros
  const filters: any = {
    _and: [],
  };

  if (params.status) {
    filters._and.push({
      status: {
        key: { _eq: params.status },
      },
    });
  }

  if (params.priority) {
    filters._and.push({
      priority: {
        key: { _eq: params.priority },
      },
    });
  }

  if (params.assigned_to) {
    filters._and.push({
      assigned_to: { _eq: params.assigned_to },
    });
  }

  if (params.account) {
    filters._and.push({
      account: { _eq: params.account },
    });
  }

  if (params.search) {
    filters._and.push({
      subject: { _icontains: params.search },
    });
  }

  // Si no hay filtros, eliminar _and vacío
  const finalFilter = filters._and.length > 0 ? filters : {};

  // Obtener tickets con sintaxis de objeto anidado
  const tickets = await directusServer.request(
    readItems('tickets', {
      filter: finalFilter,
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
      sort: ['-date_created'],
      limit: -1,
    })
  );

  return tickets as Ticket[];
}

function getStatusVariant(statusKey: string): 'default' | 'secondary' | 'destructive' | 'outline' {
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

function getPriorityVariant(priorityKey: string): 'default' | 'secondary' | 'destructive' | 'outline' {
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

export async function TicketsTable({ searchParams }: TicketsTableProps) {
  const params = await searchParams;
  const tickets = await getTickets(params);

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron tickets</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asunto</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Asignado a</TableHead>
            <TableHead>Creado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <Link
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="font-medium hover:underline"
                >
                  {ticket.subject}
                </Link>
              </TableCell>
              <TableCell>
                {ticket.account ? (
                  <Link
                    href={`/dashboard/crm/accounts/${ticket.account.id}`}
                    className="text-sm hover:underline"
                  >
                    {ticket.account.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(ticket.status.key || '')}>
                  {ticket.status.label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityVariant(ticket.priority.key || '')}>
                  {ticket.priority.label}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {ticket.assigned_to
                  ? `${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name}`
                  : <span className="text-muted-foreground">Sin asignar</span>}
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
  );
}