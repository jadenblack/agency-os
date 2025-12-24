import { directusServer } from '@/lib/directus';
import { readItem, readUsers, readItems } from '@directus/sdk';
import { notFound } from 'next/navigation';
import AccountForm from '@/components/crm/account-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditAccountPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = await params;

  try {
    const account = await directusServer.request(
      readItem('accounts', id, {
        fields: [
  '*',
  {
    account_owner: ['id'],
    country: ['id'],
  },
],
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

    const countries = await directusServer.request(
      readItems('countries', {
        fields: ['id', 'name'],
        sort: ['name'],
      })
    );

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/crm/accounts/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la cuenta
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Editar Cuenta</h1>
          <p className="text-muted-foreground">
            Actualiza la informacion de la cuenta
          </p>
        </div>

        <AccountForm
          account={account}
          users={users as any}
          countries={countries as any}
        />
      </div>
    );
  } catch (error) {
    notFound();
  }
}