import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket } from '@/types/tickets';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

interface TicketHeaderProps {
  ticket: Ticket;
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

export function TicketHeader({ ticket }: TicketHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Título y badges */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusVariant(ticket.status.key || '')}>
                {ticket.status.label}
              </Badge>
              <Badge variant={getPriorityVariant(ticket.priority.key || '')}>
                {ticket.priority.label}
              </Badge>
              {ticket.category && (
                <Badge variant="outline">{ticket.category.label}</Badge>
              )}
            </div>
          </div>

          {/* Información del ticket */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Cuenta</p>
              {ticket.account ? (
                <Link
                  href={`/dashboard/crm/accounts/${ticket.account.id}`}
                  className="font-medium hover:underline"
                >
                  {ticket.account.name}
                </Link>
              ) : (
                <p className="font-medium">-</p>
              )}
            </div>

            <div>
              <p className="text-muted-foreground">Asignado a</p>
              <p className="font-medium">
                {ticket.assigned_to
                  ? `${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name}`
                  : 'Sin asignar'}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Solicitante</p>
              <p className="font-medium">
                {ticket.requester_contact
                  ? `${ticket.requester_contact.first_name} ${ticket.requester_contact.last_name}`
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Creado</p>
              <p className="font-medium">
                {ticket.date_created
                  ? formatDistanceToNow(new Date(ticket.date_created), {
                      addSuffix: true,
                      locale: es,
                    })
                  : '-'}
              </p>
            </div>
          </div>

          {/* Descripción inicial */}
          {ticket.description && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Descripción</p>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>
          )}

          {/* Métricas de tiempo */}
          {(ticket.first_response_at || ticket.resolved_at) && (
            <div className="pt-4 border-t grid grid-cols-2 gap-4 text-sm">
              {ticket.first_response_at && (
                <div>
                  <p className="text-muted-foreground">Primera respuesta</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(ticket.first_response_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              )}
              {ticket.resolved_at && (
                <div>
                  <p className="text-muted-foreground">Resuelto</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(ticket.resolved_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}