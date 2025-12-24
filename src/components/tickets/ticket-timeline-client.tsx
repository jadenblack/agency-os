import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketWithMessages } from '@/types/tickets';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';

interface TicketTimelineClientProps {
  ticket: TicketWithMessages;
  currentUserId?: string;
}

export function TicketTimelineClient({ ticket, currentUserId }: TicketTimelineClientProps) {
  if (!ticket.messages || ticket.messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Aún no hay respuestas. Nuestro equipo te responderá pronto.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversación ({ticket.messages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ticket.messages.map((message) => (
            <div key={message.id} className="border rounded-lg p-4 bg-white">
              {/* Header del mensaje */}
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">
                  {message.author
                    ? `${message.author.first_name} ${message.author.last_name}`
                    : 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {message.date_created
                    ? formatDistanceToNow(new Date(message.date_created), {
                        addSuffix: true,
                        locale: es,
                      })
                    : '-'}
                </p>
              </div>

              {/* Cuerpo del mensaje */}
              {message.body && (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}