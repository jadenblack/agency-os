import { directusServer } from '@/lib/directus';
import { readItem, readItems } from '@directus/sdk';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Mail, Phone, FileText } from 'lucide-react';
import Link from 'next/link';

interface ContactDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;

  try {
    const contact = await directusServer.request(
      readItem('contacts', id, {
        fields: ['*'],
      })
    );

  // Obtener accounts relacionadas via account_members
    const accountMembers = await directusServer.request(
      readItems('account_members', {
        filter: {
          contact: {
            _eq: id,
          },
        },
        fields: [
          'id',
          'job_title',
          'is_primary',
          {
            account: ['id', 'name'],
          },
        ],
      })
    );

    // Obtener deals relacionados
    const deals = await directusServer.request(
      readItems('deals', {
        filter: {
          contact: {
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

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/crm/contacts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Contactos
          </Link>
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {contact.first_name} {contact.last_name}
            </h1>
            <p className="text-muted-foreground mt-1">
                Creado el {contact.date_created 
                    ? new Date(contact.date_created).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })
                : 'Fecha desconocida'}
            </p>
          </div>
          <Button asChild>
            <Link href={`/dashboard/crm/contacts/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informacion de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${contact.email}`} className="hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${contact.phone}`} className="hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cuentas asociadas</CardTitle>
            </CardHeader>
            <CardContent>
              {accountMembers.length > 0 ? (
                <div className="space-y-2">
                  {accountMembers.map((member: any) => (
                    <div key={member.id}>
                      <Link
                        href={`/dashboard/crm/accounts/${member.account.id}`}
                        className="font-medium hover:underline"
                      >
                        {member.account.name}
                      </Link>
                      {member.job_title && (
                        <p className="text-sm text-muted-foreground">
                          {member.job_title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin cuentas asociadas
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Deals */}
        <Card>
          <CardHeader>
            <CardTitle>Deals relacionados</CardTitle>
          </CardHeader>
          <CardContent>
            {deals.length > 0 ? (
              <div className="space-y-3">
                {deals.map((deal: any) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <Link
                        href={`/dashboard/crm/deals/${deal.id}`}
                        className="font-medium hover:underline"
                      >
                        {deal.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {deal.stage.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {deal.value_eur
                          ? new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(deal.value_eur)
                          : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No hay deals asociados
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notas */}
        {contact.notes && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Notas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{contact.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
}