import { auth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Ticket, FileText, Clock } from 'lucide-react';
import { directusServer } from '@/lib/directus';
import { readItems } from '@directus/sdk';

async function getClientStats(userId: string) {
  try {
    // Obtener cuenta del usuario
    const accountMembers = await directusServer.request(
      readItems('account_members', {
        filter: {
          user: { _eq: userId },
        },
        fields: [
          'id',
          {
            account: ['id'],
          },
        ],
        limit: 1,
      })
    );

    if (!accountMembers || accountMembers.length === 0) {
      return { accountId: null, openTickets: 0, totalTickets: 0 };
    }

    const accountId = (accountMembers[0].account as any)?.id;

    if (!accountId) {
      return { accountId: null, openTickets: 0, totalTickets: 0 };
    }

    // Obtener todos los tickets de la cuenta
    const allTickets = await directusServer.request(
      readItems('tickets', {
        filter: {
          account: { _eq: accountId },
        },
        fields: [
          'id',
          {
            status: ['key'],
          },
        ],
      })
    );

    const openTickets = allTickets.filter((ticket: any) =>
      ['open', 'in_progress', 'waiting_customer'].includes(ticket.status?.key)
    );

    return {
      accountId,
      openTickets: openTickets.length,
      totalTickets: allTickets.length,
    };
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return { accountId: null, openTickets: 0, totalTickets: 0 };
  }
}

export default async function PortalPage() {
  const session = await auth();
  const stats = session?.user?.id
    ? await getClientStats(session.user.id)
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenido, {session?.user?.name || 'Cliente'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tus tickets y accede a recursos de ayuda
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tickets Abiertos
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openTickets || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tickets pendientes de resolución
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tickets
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTickets || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tickets totales creados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Promedio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">
              Primera respuesta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Necesitas ayuda? Crea un nuevo ticket y nuestro equipo te
              responderá lo antes posible.
            </p>
            <Button asChild className="w-full">
              <Link href="/portal/tickets/new">
                <Ticket className="mr-2 h-4 w-4" />
                Crear Ticket
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base de Conocimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Encuentra respuestas a preguntas frecuentes y guías de uso de
              nuestros servicios.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/portal/knowledge-base">
                <FileText className="mr-2 h-4 w-4" />
                Explorar Artículos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}