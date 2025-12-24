import { directusServer } from '@/lib/directus';
import { readItems, readUsers } from '@directus/sdk';
import DealsPipeline from '@/components/crm/deals-pipeline';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Pipeline - Deals',
};

export default async function PipelinePage() {
  // Obtener stages
  const stages = await directusServer.request(
    readItems('deal_stages', {
      fields: ['id', 'key', 'label'],
      sort: ['key'],
    })
  );

// Obtener deals con todas sus relaciones
  const deals = await directusServer.request(
    readItems('deals', {
      fields: [
        'id',
        'title',
        'value_eur',
        'probability',
        {
          stage: ['id', 'key', 'label'],
          account: ['id', 'name'],
          contact: ['id', 'first_name', 'last_name'],
          owner: ['id', 'first_name', 'last_name'],
        },
      ],
      sort: ['-date_created'],
    })
  );

  // Obtener owners para filtros
  const owners = await directusServer.request(
    readUsers({
      fields: ['id', 'first_name', 'last_name'],
      filter: {
        status: {
          _eq: 'active',
        },
      },
    })
  );

  // Obtener accounts para filtros
  const accounts = await directusServer.request(
    readItems('accounts', {
      fields: ['id', 'name'],
      sort: ['name'],
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline de Deals</h1>
          <p className="text-muted-foreground">
            Vista kanban de tus deals por stage
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/crm/deals">
            <List className="mr-2 h-4 w-4" />
            Vista Lista
          </Link>
        </Button>
      </div>

      {/* Pipeline */}
      <DealsPipeline
        stages={stages as any}
        deals={deals as any}
        owners={owners as any}
        accounts={accounts as any}
      />
    </div>
  );
}