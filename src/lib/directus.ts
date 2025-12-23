import { createDirectus, rest, authentication, staticToken } from '@directus/sdk';
import type { DirectusSchema as GeneratedSchema } from '@/types/directus'; // <-- Importar el generado

// Usa el schema generado para el cliente (tiene todos los operadores de filtro correctos)
export const directusServer = createDirectus<GeneratedSchema>(
  process.env.NEXT_PUBLIC_DIRECTUS_URL!
)
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN!))
  .with(rest());

export const directusClient = createDirectus<GeneratedSchema>(
  process.env.NEXT_PUBLIC_DIRECTUS_URL!
)
  .with(authentication('cookie', { credentials: 'include' }))
  .with(rest());

export function createDirectusClient(token?: string) {
  if (token) {
    return createDirectus<GeneratedSchema>(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(staticToken(token))
      .with(rest());
  }
  return directusClient;
}

// ========== Interfaces detalladas para uso en componentes ==========
// Estas son más específicas y mejor documentadas que las generadas
// Úsalas en tus componentes para mejor autocompletado

export interface Account {
  id: string;
  name: string;
  legal_name?: string;
  status?: 'prospect' | 'lead' | 'active' | 'on_hold' | 'inactive';
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  zip_code?: string;
  state?: string;
  country?: string;
  tax_id?: string;
  notes?: string;
  account_owner?: string;
  date_created?: string;
  date_updated?: string;
  user_created?: string;
  user_updated?: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  contact_role?: 'decision_maker' | 'technical' | 'administrative' | 'commercial' | 'other';
  notes?: string;
  date_created?: string;
  date_updated?: string;
}

export interface Deal {
  id: string;
  title: string;
  account: string;
  contact?: string;
  owner?: string;
  stage: string;
  value_eur?: number;
  probability?: number;
  expected_close_date?: string;
  notes?: string;
  date_created?: string;
  date_updated?: string;
}

export interface DealStage {
  id: string;
  key: string;
  label: string;
  sort?: number;
  is_won?: boolean;
  is_lost?: boolean;
  is_active?: boolean;
}

export interface DealItem {
  id: string;
  deal: string;
  package: string;
  quantity?: number;
  unit_price?: number;
  notes?: string;
}

export interface Activity {
  id: string;
  account?: string;
  deal?: string;
  contact?: string;
  owner: string;
  type?: 'call' | 'meeting' | 'email' | 'follow_up' | 'note';
  subject: string;
  description?: string;
  scheduled_at?: string;
  completed_at?: string;
  date_created?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  account?: string;
  owner?: string;
  status: string;
  package?: string;
  start_date?: string;
  end_date?: string;
  date_created?: string;
  date_updated?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project: string;
  status: string;
  priority: string;
  assignee?: string;
  owner?: string;
  parent_task?: string;
  due_date?: string;
  estimated_minutes?: number;
  date_created?: string;
  date_updated?: string;
}

export interface TaskTimeEntry {
  id: string;
  task: string;
  user: string;
  date: string;
  minutes: number;
  notes?: string;
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  project: string;
  status: string;
  due_date?: string;
  sort?: number;
}

export interface Ticket {
  id: string;
  subject: string;
  description?: string;
  account?: string;
  requester_contact?: string;
  assigned_to?: string;
  status: string;
  priority: string;
  category?: string;
  package?: string;
  channel?: 'portal' | 'email' | 'phone' | 'whatsapp';
  first_response_at?: string;
  resolved_at?: string;
  last_customer_reply_at?: string;
  last_agent_reply_at?: string;
  date_created?: string;
  date_updated?: string;
}

export interface TicketMessage {
  id: string;
  ticket: string;
  author?: string;
  body: string;
  is_internal?: boolean;
  source?: 'portal' | 'email' | 'phone' | 'whatsapp';
  date_created?: string;
}

export interface TicketCategory {
  id: string;
  key: string;
  label: string;
  sort?: number;
  is_active?: boolean;
}

export interface KBArticle {
  id: string;
  title: string;
  slug: string;
  body: string;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  account?: string;
  services?: string[];
  published_at?: string;
  date_created?: string;
  date_updated?: string;
}

export interface KBCategory {
  id: string;
  key: string;
  label: string;
  status: 'draft' | 'published' | 'archived';
  sort?: number;
  is_active?: boolean;
}

export interface DocsPage {
  id: string;
  title: string;
  slug: string;
  body: string;
  space: string;
  parent_page?: string;
  status: 'draft' | 'published' | 'archived';
  sort?: number;
  date_created?: string;
  date_updated?: string;
}

export interface DocsSpace {
  id: string;
  key: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  team?: string;
  visibility?: 'all_employees' | 'team_only' | 'admins';
  sort?: number;
  is_active?: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  team?: string;
  is_private?: boolean;
  is_active?: boolean;
}

export interface ChatChannelMember {
  id: string;
  channel: string;
  user: string;
  role?: 'member' | 'admin';
  is_muted?: boolean;
}

export interface ChatMessage {
  id: string;
  channel: string;
  sender: string;
  content: string;
  message_type?: 'text' | 'system';
  reply_to?: string;
  is_deleted?: boolean;
  date_created?: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
  sort?: number;
}

export interface ServicePackage {
  id: string;
  service: string;
  name: string;
  code: string;
  description?: string;
  base_price?: number;
  billing_model: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  is_active?: boolean;
  sort?: number;
}

export interface AccountService {
  id: string;
  account: string;
  package: string;
  status: 'active' | 'paused' | 'finished';
  star_date?: string;
  end_date?: string;
  price?: number;
  notes?: string;
}

export interface AccountMember {
  id: string;
  account: string;
  user: string;
  contact?: string;
  job_title?: string;
  role_in_portal?: 'admin' | 'member' | 'readonly';
  is_primary?: boolean;
}

export interface Status {
  id: string;
  key: string;
  label: string;
  scope: 'ticket' | 'project' | 'task' | 'milestone';
  sort?: number;
  is_final?: boolean;
  is_active?: boolean;
}

export interface Priority {
  id: string;
  key: string;
  label: string;
  scope: 'ticket' | 'task';
  sort?: number;
  is_active?: boolean;
}

export interface Team {
  id: string;
  key: string;
  name: string;
  is_active?: boolean;
  sort?: number;
}

export interface TeamMember {
  id: string;
  team: string;
  user: string;
  role?: string;
}

export interface Country {
  id: string;
  code: string;
  name: string;
  is_active?: boolean;
  sort?: number;
}

export interface DirectusUser {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: string;
}

export interface DirectusFile {
  id: string;
  filename_disk: string;
  filename_download: string;
  title?: string;
  type?: string;
  filesize?: number;
  uploaded_on?: string;
}