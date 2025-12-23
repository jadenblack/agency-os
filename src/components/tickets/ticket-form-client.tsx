'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const clientTicketSchema = z.object({
  subject: z.string().min(1, 'El asunto es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.string().optional(),
  package: z.string().optional(),
});

type ClientTicketFormValues = z.infer<typeof clientTicketSchema>;

interface TicketFormClientProps {
  userId: string;
}

export function TicketFormClient({ userId }: TicketFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);

  const form = useForm<ClientTicketFormValues>({
    resolver: zodResolver(clientTicketSchema),
    defaultValues: {
      subject: '',
      description: '',
      category: '',
      package: '',
    },
  });

  // Cargar datos del cliente
  useEffect(() => {
    async function loadClientData() {
      try {
        // Obtener cuenta del usuario
        const accountRes = await fetch(`/api/client/account`);
        if (accountRes.ok) {
          const accountData = await accountRes.json();
          setAccountId(accountData.id);
        }

        // Cargar categorías
        const categoriesRes = await fetch('/api/tickets/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        // Cargar paquetes/servicios
        const packagesRes = await fetch('/api/service-packages');
        if (packagesRes.ok) {
          const packagesData = await packagesRes.json();
          setPackages(packagesData);
        }
      } catch (error) {
        console.error('Error loading client data:', error);
      }
    }

    loadClientData();
  }, [userId]);

  const onSubmit = async (data: ClientTicketFormValues) => {
    if (!accountId) {
      toast.error('No se pudo obtener tu cuenta. Intenta de nuevo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: data.subject,
          description: data.description,
          account: accountId,
          category: data.category || undefined,
          package: data.package || undefined,
          channel: 'portal',
          // Los clientes no pueden establecer estos campos
          // Se establecerán automáticamente en el backend
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el ticket');
      }

      const result = await response.json();

      toast.success('Ticket creado correctamente. Te responderemos pronto.');
      router.push(`/portal/tickets/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Información básica */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asunto *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: Problema con el acceso al panel"
                      />
                    </FormControl>
                    <FormDescription>
                      Título breve que describa tu consulta o problema
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe con detalle tu problema o consulta..."
                        rows={6}
                      />
                    </FormControl>
                    <FormDescription>
                      Proporciona todos los detalles relevantes para que podamos
                      ayudarte mejor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información adicional */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">
                Información adicional (opcional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Ayúdanos a clasificar tu solicitud
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="package"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servicio relacionado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar servicio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              {pkg.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        ¿Con qué servicio está relacionado?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información del proceso */}
            <div className="pt-4 border-t bg-blue-50 -mx-6 px-6 py-4 rounded-b-lg">
              <h4 className="font-medium text-sm mb-2">📋 Qué pasará después:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tu ticket será asignado a un miembro de nuestro equipo</li>
                <li>• Recibirás una primera respuesta en menos de 24 horas</li>
                <li>• Podrás seguir la conversación desde tu portal</li>
                <li>• Te notificaremos por email de cualquier actualización</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando ticket...' : 'Crear ticket'}
          </Button>
        </div>
      </form>
    </Form>
  );
}