// src/app/(dashboard)/dashboard/crm/activities/[id]/edit/page.tsx
import { directusServer } from '@/lib/directus';
import { readItem, readItems, readUsers } from '@directus/sdk';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import ActivityEditForm from '@/components/crm/activity-edit-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditActivityPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  try {
    // Obtener la actividad
    const activity = await directusServer.request(
      readItem('activities', id, {
        fields: ['*'],
      })
    );

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

        <ActivityEditForm
          activity={activity as any}
          users={users as any}
          deals={deals as any}
          contacts={contacts as any}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading activity:', error);
    notFound();
  }
}