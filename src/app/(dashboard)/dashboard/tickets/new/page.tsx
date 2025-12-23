import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TicketForm } from '@/components/tickets/ticket-form';

export default function NewTicketPage() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/tickets">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Tickets
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Nuevo Ticket</h1>
        <p className="text-muted-foreground mt-1">
          Crea un nuevo ticket de soporte
        </p>
      </div>

      {/* Form */}
      <TicketForm />
    </div>
  );
}