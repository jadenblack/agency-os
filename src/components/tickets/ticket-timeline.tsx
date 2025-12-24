import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketWithMessages } from '@/types/tickets';
import { FileList } from '@/components/tickets/file-list';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Lock } from 'lucide-react';

interface TicketTimelineProps {
  ticket: TicketWithMessages;
  currentUserId?: string;
}

export function TicketTimeline({ ticket, currentUserId }: TicketTimelineProps) {
  if (!ticket.messages || ticket.messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay mensajes aún. Sé el primero en responder.
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
          {ticket.messages.map((message) => {
            const authorId = typeof message.author === 'string' 
              ? message.author 
              : message.author?.id;
            const canDeleteFiles = currentUserId === authorId;

            return (
              <div
                key={message.id}
                className={`border rounded-lg p-4 ${
                  message.is_internal ? 'bg-yellow-50 border-yellow-200' : 'bg-white'
                }`}
              >
                {/* Header del mensaje */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">
                      {typeof message.author === 'object' && message.author
                        ? `${message.author.first_name} ${message.author.last_name}`
                        : 'Usuario eliminado'}
                    </p>
                    {message.is_internal && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Nota interna
                      </Badge>
                    )}
                    {message.source && (
                      <Badge variant="secondary" className="text-xs">
                        {message.source}
                      </Badge>
                    )}
                  </div>
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

                {/* Archivos adjuntos */}
                {message.files && message.files.length > 0 && (
                  <FileList
                    messageId={message.id}
                    files={message.files}
                    canDelete={canDeleteFiles}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}