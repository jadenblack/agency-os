'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Abierto' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'waiting_customer', label: 'Esperando Cliente' },
  { value: 'resolved', label: 'Resuelto' },
  { value: 'closed', label: 'Cerrado' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export function TicketsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/tickets?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/dashboard/tickets');
  };

  const hasFilters =
    searchParams.get('status') ||
    searchParams.get('priority') ||
    searchParams.get('assigned_to') ||
    searchParams.get('account') ||
    searchParams.get('search');

  return (
    <div className="flex flex-wrap gap-4">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Buscar por asunto..."
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => {
            const value = e.target.value;
            setTimeout(() => updateFilter('search', value), 500);
          }}
        />
      </div>

      {/* Status Filter */}
      <Select
        value={searchParams.get('status') || 'all'}
        onValueChange={(value) => updateFilter('status', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={searchParams.get('priority') || 'all'}
        onValueChange={(value) => updateFilter('priority', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las prioridades</SelectItem>
          {PRIORITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} size="sm">
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}