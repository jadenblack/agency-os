import { directusServer } from '@/lib/directus';
import { readItems, readUsers } from '@directus/sdk';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import ActivityForm from '@/components/crm/activity-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Nueva Actividad - CRM',
};

export default async function NewActivityPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  try {
    // Obtener usuarios activos
    const users = await directusServer.request(
      readUsers({
        fields: ['id', 'first_name', 'last_name'],
        filter: {
          status: {
            _eq: 'active',
          },
        },
        sort: ['first_name', 'last_name'],
      })
    );

    // Obtener deals
    const deals = await directusServer.request(
      readItems('deals', {
        fields: ['id', 'title'],
        sort: ['title'],
        limit: -1,
      })
    );

    // Obtener contactos
    const contacts = await directusServer.request(
      readItems('contacts', {
        fields: ['id', 'first_name', 'last_name'],
        sort: ['first_name', 'last_name'],
        limit: -1,
      })
    );

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/crm/activities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Actividades
          </Link>
        </Button>

        <ActivityForm
          users={users as any}
          deals={deals as any}
          contacts={contacts as any}
          currentUserId={session.user.id}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading form data:', error);
    notFound();
  }
}