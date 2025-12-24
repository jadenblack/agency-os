import { directusServer } from '@/lib/directus';
import { readItem, readItems, readUsers } from '@directus/sdk';
import { notFound } from 'next/navigation';
import AccountHeader from '@/components/crm/account-header';
import AccountTabs from '@/components/crm/account-tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AccountDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { id } = await params;
  
  try {
    // Obtener datos de la cuenta
    const account = await directusServer.request(
      readItem('accounts', id, {
        fields: [
          '*',
          {
            account_owner: ['id', 'first_name', 'last_name', 'email'],
            country: ['name'],
          },
        ],
      })
    );

    // Obtener deals relacionados
    const deals = await directusServer.request(
      readItems('deals', {
        filter: {
          account: {
            _eq: id,
          },
        },
        fields: [
          'id',
          'title',
          'value_eur',
          {
            stage: ['label'],
          },
        ],
        sort: ['-date_created'],
      })
    );

    // Obtener members (equipo y contactos)
    const members = await directusServer.request(
      readItems('account_members', {
        filter: {
          account: {
            _eq: id,
          },
        },
        fields: [
          'id',
          'job_title',
          'is_primary',
          {
            user: ['id', 'first_name', 'last_name', 'email'],
            contact: ['id', 'first_name', 'last_name', 'email'],
          },
        ],
        sort: ['-is_primary'],
      })
    );

    // Obtener proyectos
    const projects = await directusServer.request(
      readItems('projects', {
        filter: {
          account: {
            _eq: id,
          },
        },
        fields: [
          '*',
          {
            status: ['label'],
            owner: ['first_name', 'last_name'],
          },
        ],
      })
    );

    // Obtener tickets
    const tickets = await directusServer.request(
      readItems('tickets', {
        filter: {
          account: {
            _eq: id,
          },
        },
        fields: [
          '*',
          {
            status: ['label'],
            priority: ['label'],
            assigned_to: ['first_name', 'last_name'],
          },
        ],
      })
    );

    // Obtener usuarios para añadir al equipo
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

    // Obtener contactos disponibles
    const contacts = await directusServer.request(
      readItems('contacts', {
        fields: ['id', 'first_name', 'last_name', 'email'],
        sort: ['first_name'],
      })
    );

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/crm/accounts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Cuentas
          </Link>
        </Button>

        <AccountHeader account={account as any} />

        <AccountTabs 
          account={account as any} 
          deals={deals as any}
          members={members as any}
          projects={projects as any}
          tickets={tickets as any}
          users={users as any}
          contacts={contacts as any}
        />
      </div>
    );
  } catch (error) {
    notFound();
  }
}