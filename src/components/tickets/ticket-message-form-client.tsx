'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface TicketMessageFormClientProps {
  ticketId: string;
}

export function TicketMessageFormClient({
  ticketId,
}: TicketMessageFormClientProps) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          body: body.trim(),
          is_internal: false,
          source: 'portal',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el mensaje');
      }

      toast.success('Mensaje enviado correctamente');
      setBody('');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Responder</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Escribe tu respuesta aquí..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Enviando...' : 'Enviar respuesta'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}