'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Phone,
  Users,
  Mail,
  Bell,
  FileText,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AddActivityDialog from './add-activity-dialog';

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

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Props {
  dealId: string;
  activities: Activity[];
  users: User[];
  currentUserId: string;
}

export default function DealActivitiesManager({ dealId, activities, users, currentUserId }: Props) {
  const router = useRouter();
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [activityToComplete, setActivityToComplete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleDelete = async () => {
    if (!activityToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/crm/activities/${activityToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la actividad');
      }

      toast.success('Actividad eliminada');
      router.refresh();
    } catch (error) {
      toast.error('Error al eliminar la actividad');
    } finally {
      setIsDeleting(false);
      setActivityToDelete(null);
    }
  };

  const handleComplete = async () => {
    if (!activityToComplete) return;

    setIsCompleting(true);
    try {
      const response = await fetch(`/api/crm/activities/${activityToComplete}/complete`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Error al completar la actividad');
      }

      toast.success('Actividad completada');
      router.refresh();
    } catch (error) {
      toast.error('Error al completar la actividad');
    } finally {
      setIsCompleting(false);
      setActivityToComplete(null);
    }
  };

  const getActivityIcon = (type: string | null) => {
    switch (type) {
      case 'call':
        return <Phone className="h-5 w-5" />;
      case 'meeting':
        return <Users className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'follow_up':
        return <Bell className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getActivityTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      call: 'Llamada',
      meeting: 'Reunión',
      email: 'Email',
      follow_up: 'Seguimiento',
      note: 'Nota',
    };
    return type ? labels[type] || type : 'Actividad';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historial de actividades</CardTitle>
            <AddActivityDialog
              dealId={dealId}
              users={users}
              currentUserId={currentUserId}
            />
          </div>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="flex-shrink-0 text-muted-foreground">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{activity.subject}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {getActivityTypeLabel(activity.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {!activity.completed_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActivityToComplete(activity.id)}
                            className="cursor-pointer hover:bg-green-100 hover:text-green-700" // <-- Agregar
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActivityToDelete(activity.id)}
                          className="cursor-pointer hover:bg-red-100 hover:text-red-700" // <-- Agregar
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {activity.owner && (
                        <span>
                          {activity.owner.first_name} {activity.owner.last_name}
                        </span>
                      )}
                      {activity.scheduled_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(activity.scheduled_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                      {activity.completed_at ? (
                        <Badge variant="default" className="text-xs">
                          Completada
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Pendiente
                        </Badge>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(activity.date_created), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay actividades registradas
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <AlertDialog
        open={!!activityToDelete}
        onOpenChange={() => setActivityToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar actividad</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete dialog */}
      <AlertDialog
        open={!!activityToComplete}
        onOpenChange={() => setActivityToComplete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Completar actividad</AlertDialogTitle>
            <AlertDialogDescription>
              Marcar esta actividad como completada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={isCompleting}>
              {isCompleting ? 'Completando...' : 'Completar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}