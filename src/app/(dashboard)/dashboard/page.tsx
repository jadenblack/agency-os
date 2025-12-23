// src/app/(dashboard)/dashboard/page.tsx
import { directusServer } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Briefcase, 
  FolderKanban, 
  Ticket,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  try {
    // CRM Data
    const accounts = await directusServer.request(
      readItems('accounts', {
        fields: ['id'],
        limit: -1,
      })
    );

    const deals = await directusServer.request(
      readItems('deals', {
        fields: [
          'id',
          'value_eur',
          { stage: ['key'] }
        ],
        limit: -1,
      })
    );

    const activeDeals = deals.filter((d: any) => 
      d.stage?.key !== 'won' && d.stage?.key !== 'lost'
    );

    const totalPipelineValue = activeDeals.reduce(
      (sum: number, deal: any) => sum + (deal.value_eur || 0), 
      0
    );

    // Activities Data
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayActivities = await directusServer.request(
      readItems('activities', {
        filter: {
          completed_at: { _null: true },
          scheduled_at: {
            _gte: todayStart.toISOString(),
            _lte: todayEnd.toISOString(),
          },
        },
        fields: [
          'id',
          'subject',
          'type',
          'scheduled_at',
          { deal: ['title'] }
        ],
        sort: ['scheduled_at'],
        limit: 5,
      })
    );

    const pendingActivities = await directusServer.request(
      readItems('activities', {
        filter: {
          completed_at: { _null: true },
        },
        fields: ['id'],
        limit: -1,
      })
    );

    // Tickets data
    const allTickets = await directusServer.request(
      readItems('tickets', {
        fields: [
          'id',
          { status: ['key'] },
          'assigned_to'
        ],
        limit: -1,
      })
    );

    const openTickets = allTickets.filter((t: any) => 
      t.status?.key === 'open' || 
      t.status?.key === 'in_progress' || 
      t.status?.key === 'waiting_customer'
    );

    const unassignedTickets = allTickets.filter((t: any) => !t.assigned_to);

    // TODO: Projects data (cuando lo implementes)
    const projects = { active: 0, total: 0 };
    
    // TODO: Tasks data (cuando lo implementes)
    const tasks = { pending: 0, overdue: 0 };

    const stats = [
      {
        name: 'Cuentas',
        value: accounts.length.toString(),
        icon: Users,
        description: 'Clientes activos',
        href: '/dashboard/crm/accounts',
        color: 'text-blue-600',
      },
      {
        name: 'Deals Activos',
        value: activeDeals.length.toString(),
        icon: Briefcase,
        description: `€${totalPipelineValue.toLocaleString('es-ES')}`,
        href: '/dashboard/crm/deals',
        color: 'text-green-600',
      },
      {
        name: 'Actividades Hoy',
        value: todayActivities.length.toString(),
        icon: Calendar,
        description: `${pendingActivities.length} pendientes total`,
        href: '/dashboard/crm/activities',
        color: 'text-purple-600',
      },
      {
        name: 'Proyectos',
        value: projects.active.toString(),
        icon: FolderKanban,
        description: 'Próximamente',
        href: '/dashboard',
        color: 'text-orange-600',
      },
      {
        name: 'Tickets Abiertos',
        value: openTickets.length.toString(),
        icon: Ticket,
        description: `${unassignedTickets.length} sin asignar`,
        href: '/dashboard/tickets',
        color: 'text-red-600',
      },
      {
        name: 'Tareas',
        value: tasks.pending.toString(),
        icon: CheckCircle2,
        description: 'Próximamente',
        href: '/dashboard',
        color: 'text-indigo-600',
      },
    ];

    const getActivityIcon = (type: string | null) => {
      const icons: Record<string, string> = {
        call: '📞',
        meeting: '👥',
        email: '📧',
        follow_up: '↪️',
        note: '📝',
      };
      return type ? icons[type] || '📋' : '📋';
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Vista general de tu agencia
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Access */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/crm">
            <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  CRM
                </CardTitle>
                <CardDescription>
                  Gestiona cuentas, deals y actividades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ver dashboard →</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/tickets">
            <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-red-600" />
                  Tickets
                </CardTitle>
                <CardDescription>
                  Sistema de soporte al cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ver tickets →</span>
                  {openTickets.length > 0 && (
                    <Badge variant="destructive">{openTickets.length} abiertos</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-orange-600" />
                Proyectos
              </CardTitle>
              <CardDescription>
                Gestión de proyectos y tareas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Próximamente</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Today's Activities & Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Today's Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Actividades de Hoy</CardTitle>
              <CardDescription>
                Tareas programadas para hoy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayActivities.length > 0 ? (
                <div className="space-y-4">
                  {todayActivities.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.subject}</p>
                        {activity.deal && (
                          <p className="text-xs text-muted-foreground">
                            {activity.deal.title}
                          </p>
                        )}
                        {activity.scheduled_at && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.scheduled_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay actividades programadas para hoy
                </p>
              )}
            </CardContent>
          </Card>

          {/* CRM Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen CRM</CardTitle>
              <CardDescription>
                Métricas principales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pipeline Value</span>
                <span className="text-lg font-bold">
                  €{totalPipelineValue.toLocaleString('es-ES')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deals Activos</span>
                <span className="text-lg font-bold">{activeDeals.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cuentas</span>
                <span className="text-lg font-bold">{accounts.length}</span>
              </div>
              <Link href="/dashboard/crm">
                <Button variant="outline" className="w-full mt-4">
                  Ver Dashboard CRM →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Error al cargar las métricas
          </p>
        </div>
      </div>
    );
  }
}