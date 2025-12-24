import { directusServer } from '@/lib/directus';
import { readItem, readItems, readUsers } from '@directus/sdk';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import DealHeader from '@/components/crm/deal-header';
import DealTabs from '@/components/crm/deal-tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DealDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  try {
const deal = await directusServer.request(
      readItem('deals', id, {
        fields: [
          '*',
          {
            account: ['id', 'name', 'website', 'phone', 'email'],
            contact: ['id', 'first_name', 'last_name', 'email', 'phone'],
            owner: ['id', 'first_name', 'last_name', 'email'],
            stage: ['id', 'key', 'label'],
          },
        ],
      })
    );

    const dealItems = await directusServer.request(
      readItems('deal_items', {
        filter: {
          deal: {
            _eq: id,
          },
        },
        fields: [
          '*',
          {
            package: ['id', 'name', 'base_price'],
          },
        ],
      })
    );

    // ACTUALIZADO: Filtrar activities por el campo "deal" correcto
    const activities = await directusServer.request(
      readItems('activities', {
        filter: {
          deal: {
            _eq: id,
          },
        },
        fields: [
          '*',
          {
            owner: ['id', 'first_name', 'last_name'],
          },
        ],
        sort: ['-date_created'],
        limit: 100,
      })
    );

    // Obtener service packages para el selector
    const servicePackages = await directusServer.request(
      readItems('service_packages', {
        fields: ['id', 'name', 'base_price'],
        sort: ['name'],
      })
    );

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
          <Link href="/dashboard/crm/deals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Deals
          </Link>
        </Button>

        <DealHeader deal={deal as any} />

        <DealTabs
          deal={deal as any}
          dealItems={dealItems as any}
          activities={activities as any}
          servicePackages={servicePackages as any}
          users={users as any}
          currentUserId={session.user.id}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading deal:', error);
    notFound();
  }
}