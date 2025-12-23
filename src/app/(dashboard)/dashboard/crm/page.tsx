import { directusServer } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, CheckCircle2, Calendar, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Dashboard CRM',
};

export default async function CRMDashboardPage() {
  try {
    // Obtener todas las cuentas
    const accounts = await directusServer.request(
      readItems('accounts', {
        fields: ['id'],
        limit: -1,
      })
    );

    // Obtener todos los deals
    const allDeals = await directusServer.request(
  readItems('deals', {
    fields: [
      'id', 
      'title', 
      'value_eur', 
      'date_updated',
      { 
        stage: ['key', 'label'] 
      },
      {
        account: ['name']
      }
    ],
    limit: -1,
  })
);

    // Obtener deals recientes (últimos 5)
    const recentDeals = await directusServer.request(
  readItems('deals', {
    fields: [
      'id',
      'title', 
      'value_eur',
      'date_updated',
      { stage: ['label'] },
      { account: ['name'] }
    ],
    sort: ['-date_updated'],
    limit: 5,
  })
);

    // Obtener actividades pendientes
    const pendingActivities = await directusServer.request(
  readItems('activities', {
    filter: {
      completed_at: { _null: true },
    },
    fields: [
      'id',
      'subject',
      'type',
      'scheduled_at',
      { deal: ['title'] },
      { owner: ['first_name', 'last_name'] }
    ],
    sort: ['scheduled_at'],
    limit: 5,
  })
);

    // Calcular métricas
    const totalDeals = allDeals.length;
    const totalPipelineValue = allDeals.reduce((sum: number, deal: any) => sum + (deal.value_eur || 0), 0);
    
    const wonDeals = allDeals.filter((deal: any) => deal.stage?.key === 'won');
    const lostDeals = allDeals.filter((deal: any) => deal.stage?.key === 'lost');
    const activeDeals = totalDeals - wonDeals.length - lostDeals.length;
    
    const winRate = totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0;

    // Agrupar deals por stage
    const dealsByStage = allDeals.reduce((acc: any, deal: any) => {
      const stageLabel = deal.stage?.label || 'Sin stage';
      if (!acc[stageLabel]) {
        acc[stageLabel] = 0;
      }
      acc[stageLabel]++;
      return acc;
    }, {});

    const stats = [
      {
        name: 'Cuentas Activas',
        value: accounts.length.toString(),
        icon: Users,
        description: 'Total de cuentas',
        href: '/dashboard/crm/accounts',
      },
      {
        name: 'Deals Activos',
        value: activeDeals.toString(),
        icon: Briefcase,
        description: `€${totalPipelineValue.toLocaleString('es-ES')} en pipeline`,
        href: '/dashboard/crm/deals',
      },
      {
        name: 'Tasa de Conversión',
        value: `${winRate}%`,
        icon: Target,
        description: `${wonDeals.length} ganados / ${totalDeals} totales`,
        href: '/dashboard/crm/deals',
      },
      {
        name: 'Actividades Pendientes',
        value: pendingActivities.length.toString(),
        icon: Calendar,
        description: 'Sin completar',
        href: '/dashboard/crm/activities',
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
          <h2 className="text-3xl font-bold tracking-tight">Dashboard CRM</h2>
          <p className="text-muted-foreground">
            Métricas detalladas de ventas y relaciones con clientes
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pipeline Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución del Pipeline</CardTitle>
            <CardDescription>
              Deals por etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dealsByStage).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{stage}</span>
                  </div>
                  <Badge variant="secondary">{count as number}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Pending Tasks */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Deals */}
          <Card>
            <CardHeader>
              <CardTitle>Deals Recientes</CardTitle>
              <CardDescription>
                Últimas actualizaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentDeals.length > 0 ? (
                <div className="space-y-4">
                  {recentDeals.map((deal: any) => (
                    <Link
                      key={deal.id}
                      href={`/dashboard/crm/deals/${deal.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {deal.account?.name || 'Sin cuenta'}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {deal.stage?.label || 'Sin stage'}
                        </Badge>
                        {deal.value_eur && (
                          <p className="text-xs font-medium">
                            €{deal.value_eur.toLocaleString('es-ES')}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay deals recientes
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pending Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Actividades</CardTitle>
              <CardDescription>
                Tareas pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingActivities.length > 0 ? (
                <div className="space-y-4">
                  {pendingActivities.map((activity: any) => (
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
                            {new Date(activity.scheduled_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                      {activity.owner && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.owner.first_name}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay actividades pendientes
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading CRM dashboard:', error);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard CRM</h2>
          <p className="text-muted-foreground">
            Error al cargar las métricas
          </p>
        </div>
      </div>
    );
  }
}