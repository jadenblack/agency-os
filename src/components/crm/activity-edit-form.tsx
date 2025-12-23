'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { activitySchema, type ActivityFormValues } from '@/lib/validations/activity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Deal {
  id: string;
  title: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

interface Activity {
  id: string;
  subject: string;
  type?: string | null;
  description?: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  deal?: string | null;
  contact?: string | null;
  owner: string;
}

interface Props {
  activity: Activity;
  users: User[];
  deals: Deal[];
  contacts: Contact[];
}

const activityTypes = [
  { value: 'call', label: 'Llamada' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'email', label: 'Email' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'note', label: 'Nota' },
];

export default function ActivityEditForm({ activity, users, deals, contacts }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Convertir scheduled_at a formato datetime-local si existe
  const formatDateTimeLocal = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      subject: activity.subject,
      type: activity.type as any,
      description: activity.description || '',
      owner: activity.owner,
      scheduled_at: formatDateTimeLocal(activity.scheduled_at),
      deal: activity.deal || '',
      contact: activity.contact || '',
      is_completed: !!activity.completed_at,
    },
  });

  const onSubmit = async (data: ActivityFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/crm/activities/${activity.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la actividad');
      }

      toast.success('Actividad actualizada correctamente');
      router.push('/dashboard/crm/activities');
      router.refresh();
    } catch (error) {
      toast.error('Error al actualizar la actividad');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Actividad</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Asunto */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Llamada de seguimiento" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo y Responsable */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona responsable" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Deal y Contacto */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="deal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un deal (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {deals.map((deal) => (
                          <SelectItem key={deal.id} value={deal.id}>
                            {deal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      El account se establecerá automáticamente desde el deal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contacto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un contacto (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fecha programada */}
            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha programada</FormLabel>
                  <FormControl>
                    <Input {...field} type="datetime-local" />
                  </FormControl>
                  <FormDescription>
                    Opcional. Deja vacío si es una actividad pasada o sin fecha específica
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Detalles adicionales..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marcar como completada */}
            <FormField
              control={form.control}
              name="is_completed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Marcar como completada</FormLabel>
                    <FormDescription>
                      Se establecerá la fecha de finalización al momento actual
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}