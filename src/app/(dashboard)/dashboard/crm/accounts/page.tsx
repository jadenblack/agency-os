import { directusServer } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import AccountsTable from '@/components/crm/accounts-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function AccountsPage() {
  // Obtener accounts de Directus
  const accounts = await directusServer.request(
    readItems('accounts', {
      fields: [
        'id',
        'name',
        'status',
        'email',
        'phone',
        'city',
        'date_created',
        {
          account_owner: ['first_name', 'last_name'],
        },
      ],
      sort: ['-date_created'],
      limit: 100,
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cuentas</h2>
          <p className="text-gray-500">
            Gestiona tus cuentas y empresas
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/crm/accounts/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cuenta
          </Link>
        </Button>
      </div>

      {/* Stats rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Cuentas</p>
          <p className="text-2xl font-bold">{accounts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Activas</p>
          <p className="text-2xl font-bold">
            {accounts.filter((a) => a.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Leads</p>
          <p className="text-2xl font-bold">
            {accounts.filter((a) => a.status === 'lead').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Prospects</p>
          <p className="text-2xl font-bold">
            {accounts.filter((a) => a.status === 'prospect').length}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <AccountsTable accounts={accounts} />
    </div>
  );
}