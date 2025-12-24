// Types for Tickets Module
import { ticketsItem, tickets_messagesItem, directus_filesItem } from './directus';

export interface Ticket extends Omit<ticketsItem, 'account' | 'assigned_to' | 'status' | 'priority' | 'category' | 'requester_contact' | 'package' | 'attachments'> {
  account?: {
    id: string;
    name: string;
  } | null;
  assigned_to?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  status: {
    id: string;
    key: string;
    label: string;
  };
  priority: {
    id: string;
    key: string;
    label: string;
  };
  category?: {
    id: string;
    key: string;
    label: string;
  } | null;
  requester_contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  package?: {
    id: string;
    name: string;
    code: string;
  } | null;
  attachments?: directus_filesItem | string | null;
}

export interface TicketMessage extends Omit<tickets_messagesItem, 'author'> {
  author?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  files?: Array<{
    id: string;
    sort: number;
    date_created: string;
    file: {
      id: string;
      filename_download: string;
      type: string;
      filesize: number;
      title?: string | null;
    };
  }>;
}

export interface TicketWithMessages extends Ticket {
  messages: TicketMessage[];
}

// Filter types
export interface TicketFilters {
  status?: string;
  priority?: string;
  assigned_to?: string;
  account?: string;
  category?: string;
  search?: string;
}

// Form types
export interface CreateTicketInput {
  subject: string;
  description: string;
  account?: string;
  category?: string;
  package?: string;
  attachments?: string;
  // Campos solo para empleados
  assigned_to?: string;
  status?: string;
  priority?: string;
  channel?: string;
  requester_contact?: string;
}

export interface UpdateTicketInput extends Partial<CreateTicketInput> {
  id: string;
}

export interface CreateTicketMessageInput {
  ticket: string;
  body: string;
  is_internal?: boolean;
  source?: string;
}

// Status keys
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

// Priority keys
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// Channel keys
export type TicketChannel = 'email' | 'phone' | 'whatsapp' | 'portal' | 'other';