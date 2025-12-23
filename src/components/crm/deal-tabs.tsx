'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Phone, Users, Mail, Bell, FileText } from 'lucide-react';
import DealItemsManager from './deal-items-manager';
import DealActivitiesManager from './deal-activities-manager';

interface DealItem {
  id: string;
  package: {
    id: string;
    name: string;
  };
  quantity: number;
  unit_price: number | null;
  notes?: string | null;
}

interface ServicePackage {
  id: string;
  name: string;
  base_price: number | null;
}

interface Activity {
  id: string;
  type: string | null;
  subject: string;
  description?: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  date_created: string;
}

interface Deal {
  id: string;
  title: string;
  notes?: string | null;
  date_created: string;
  date_updated?: string | null;
}

interface Props {
  deal: Deal;
  dealItems: DealItem[];
  activities: Activity[];
  servicePackages: ServicePackage[];
  users: User[];
  currentUserId: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

export default function DealTabs({ deal, dealItems, activities, servicePackages, users, currentUserId }: Props) {

  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList>
        <TabsTrigger value="details">Detalles</TabsTrigger>
        <TabsTrigger value="items">
          Servicios y Productos
          {dealItems.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {dealItems.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="activities">
          Actividades
          {activities.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activities.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="notes">Notas</TabsTrigger>
      </TabsList>

      {/* Tab: Detalles */}
      <TabsContent value="details">
        <Card>
          <CardHeader>
            <CardTitle>Informacion del Deal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de creacion
                </label>
                <p className="mt-1">
                  {new Date(deal.date_created).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              {deal.date_updated && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ultima actualizacion
                  </label>
                  <p className="mt-1">
                    {formatDistanceToNow(new Date(deal.date_updated), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Items */}
      <TabsContent value="items">
        <DealItemsManager 
          dealId={deal.id}
          dealItems={dealItems}
          servicePackages={servicePackages}
        />
      </TabsContent>

      {/* Tab: Actividades */}
      <TabsContent value="activities">
        <DealActivitiesManager 
          dealId={deal.id}
          activities={activities}
          users={users}
          currentUserId={currentUserId}
        />
      </TabsContent>

      {/* Tab: Notas */}
      <TabsContent value="notes">
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            {deal.notes ? (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{deal.notes}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay notas para este deal
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}