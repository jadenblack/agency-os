import { directusServer } from '@/lib/directus';
import { readItem, readItems, readUsers } from '@directus/sdk';
import { notFound } from 'next/navigation';
import DealForm from '@/components/crm/deal-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditDealPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditDealPage({ params }: EditDealPageProps) {
  const { id } = await params;

  try {
    const deal = await directusServer.request(
      readItem('deals', id, {
        fields: [
          '*',
          {
            account: ['id'],
            contact: ['id'],
            owner: ['id'],
            stage: ['id'],
          },
        ],
      })
    );

    // Obtener accounts
    const accounts = await directusServer.request(
      readItems('accounts', {
        fields: ['id', 'name'],
        sort: ['name'],
      })
    );

    // Obtener contacts
    const contacts = await directusServer.request(
      readItems('contacts', {
        fields: ['id', 'first_name', 'last_name', 'email'],
        sort: ['first_name'],
      })
    );

    // Obtener stages
    const stages = await directusServer.request(
      readItems('deal_stages', {
        fields: ['id', 'key', 'label'],
        sort: ['key'],
      })
    );

    // Obtener users
    const users = await directusServer.request(
      readUsers({
        fields: ['id', 'first_name', 'last_name'],
        filter: {
          status: {
            _eq: 'active',
          },
        },
      })
    );

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/crm/deals/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al deal
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Editar Deal</h1>
          <p className="text-muted-foreground">
            Actualiza la informacion del deal
          </p>
        </div>

        <DealForm
          deal={deal}
          accounts={accounts as any}
          contacts={contacts as any}
          stages={stages as any}
          users={users as any}
        />
      </div>
    );
  } catch (error) {
    notFound();
  }
}