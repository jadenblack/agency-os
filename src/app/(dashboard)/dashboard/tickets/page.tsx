import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TicketsTable } from '@/components/tickets/tickets-table';
import { TicketsFilters } from '@/components/tickets/tickets-filter';

export const dynamic = 'force-dynamic';

export default function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    assigned_to?: string;
    account?: string;
    search?: string;
  }>;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los tickets de soporte de tus clientes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ticket
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Suspense fallback={<div>Cargando filtros...</div>}>
        <TicketsFilters />
      </Suspense>

      {/* Table */}
      <Suspense fallback={<div>Cargando tickets...</div>}>
        <TicketsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}