'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/tickets/file-uploader';
import { toast } from 'sonner';

interface TicketMessageFormClientProps {
  ticketId: string;
}

export function TicketMessageFormClient({ ticketId }: TicketMessageFormClientProps) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMessageId, setCreatedMessageId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      toast.error('El mensaje no puede estar vacío');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tickets/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket: ticketId,
          body,
          is_internal: false,
          source: 'portal',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al enviar el mensaje');
      }

      const data = await response.json();
      setCreatedMessageId(data.id);
      toast.success('Mensaje enviado correctamente');
      setBody('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar el mensaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadComplete = () => {
    setCreatedMessageId(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            placeholder="Escribe tu mensaje..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" disabled={isSubmitting || !body.trim()}>
          {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
        </Button>
      </form>

      {createdMessageId && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3">Adjuntar archivos al mensaje</h3>
          <FileUploader
            messageId={createdMessageId}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}
    </div>
  );
}