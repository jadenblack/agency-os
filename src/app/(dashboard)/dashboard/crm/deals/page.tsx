import { directusServer } from '@/lib/directus';
import { readItems, readUsers } from '@directus/sdk';
import DealsListClient from '@/components/crm/deals-list-client';
import { Button } from '@/components/ui/button';
import { Plus, Kanban } from 'lucide-react';
import Link from 'next/link';
import type { DealWithRelations, DealStage } from '@/types/crm';

export const metadata = {
  title: 'Deals - CRM',
};

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
}

interface AccountSimple {
  id: string;
  name: string;
}

export default async function DealsPage() {
  // Obtener deals
const dealsData = await directusServer.request(
    readItems('deals', {
      fields: [
        'id',
        'title',
        'value_eur',
        'probability',
        'expected_close_date',
        'date_created',
        {
          account: ['id', 'name'],
          contact: ['id', 'first_name', 'last_name'],
          owner: ['id', 'first_name', 'last_name'],
          stage: ['id', 'key', 'label'],
        },
      ],
      sort: ['-date_created'],
    })
  );

  // Obtener stages para filtros
  const stagesData = await directusServer.request(
    readItems('deal_stages', {
      fields: ['id', 'key', 'label'],
      sort: ['label'],
    })
  );

  // Obtener owners para filtros - USAR readUsers
  const ownersData = await directusServer.request(
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
  const accountsData = await directusServer.request(
    readItems('accounts', {
      fields: ['id', 'name'],
      sort: ['name'],
    })
  );

  // Type casting para que coincida con los tipos esperados
  const deals = dealsData as unknown as DealWithRelations[];
  const stages = stagesData as unknown as DealStage[];
  const owners = ownersData as unknown as Owner[];
  const accounts = accountsData as unknown as AccountSimple[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-muted-foreground">
            Gestiona tus deals y oportunidades de venta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/crm/deals/pipeline">
              <Kanban className="mr-2 h-4 w-4" />
              Vista Pipeline
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/crm/deals/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Deal
            </Link>
          </Button>
        </div>
      </div>

      {/* Lista de deals */}
      <DealsListClient
        deals={deals}
        stages={stages}
        owners={owners}
        accounts={accounts}
      />
    </div>
  );
}