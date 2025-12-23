'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Users,
  Mail,
  Bell,
  FileText,
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
} from 'lucide-react';
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
import { toast } from 'sonner';

interface Activity {
  id: string;
  type: string | null;
  subject: string;
  scheduled_at?: string | null;
  completed_at?: string | null;
  date_created: string;
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  deal?: {
    id: string;
    title: string;
  } | null;
  account?: {
    id: string;
    name: string;
  } | null;
}

interface Props {
  activities: Activity[];
}

export default function ActivitiesTable({ activities }: Props) {
  const router = useRouter();
  const [activityToComplete, setActivityToComplete] = useState<string | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const getActivityIcon = (type: string | null) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'follow_up':
        return <Bell className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      call: 'Llamada',
      meeting: 'Reunión',
      email: 'Email',
      follow_up: 'Seguimiento',
      note: 'Nota',
    };
    return type ? labels[type] : '-';
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No se encontraron actividades</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Actividad</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Relacionado</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Responsable</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{activity.subject}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <span className="text-sm">{getTypeLabel(activity.type)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {activity.deal && (
                        <Link
                          href={`/dashboard/crm/deals/${activity.deal.id}`}
                          className="hover:underline"
                        >
                          {activity.deal.title}
                        </Link>
                      )}
                      {activity.account && !activity.deal && (
                        <Link
                          href={`/dashboard/crm/accounts/${activity.account.id}`}
                          className="hover:underline"
                        >
                          {activity.account.name}
                        </Link>
                      )}
                      {!activity.deal && !activity.account && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {activity.owner
                      ? `${activity.owner.first_name} ${activity.owner.last_name}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {activity.completed_at ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completada
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.date_created), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {!activity.completed_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActivityToComplete(activity.id)}
                          title="Marcar como completada"
                          className="cursor-pointer hover:bg-green-100 hover:text-green-700" // <-- Agregar
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="Editar"
                        className="cursor-pointer hover:bg-blue-100 hover:text-blue-700" // <-- Agregar
                      >
                        <Link href={`/dashboard/crm/activities/${activity.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActivityToDelete(activity.id)}
                        title="Eliminar"
                        className="cursor-pointer hover:bg-red-100 hover:text-red-700" // <-- Agregar
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog para completar */}
      <AlertDialog
        open={!!activityToComplete}
        onOpenChange={() => setActivityToComplete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Completar actividad</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Marcar esta actividad como completada?
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

      {/* Dialog para eliminar */}
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
    </>
  );
}