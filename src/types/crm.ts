// Types para módulo CRM

// ============= ACCOUNTS =============
export interface Account {
  id: string;
  name: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  industry?: string | null;
  employees_count?: number | null;
  annual_revenue?: number | null;
  description?: string | null;
  billing_address?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_postal_code?: string | null;
  billing_country?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;
  account_owner?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  country?: {
    id: string;
    name: string;
  } | null;
  archived_at?: string | null;
  date_created?: string;
  date_updated?: string;
  user_created?: string;
  user_updated?: string;
}

// ============= CONTACTS =============
export interface Contact {
  id: string;
  first_name: string;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  contact_role?: 'decision_maker' | 'technical' | 'administrative' | 'commercial' | 'other' | null;
  notes?: string | null;
  archived_at?: string | null;
  date_created?: string;
  date_updated?: string;
  user_created?: string;
  user_updated?: string;
}

// ============= DEAL STAGES =============
export interface DealStage {
  id: string;
  key: string;
  label: string;
  sort?: number | null;
  is_won?: boolean;
  is_lost?: boolean;
  is_active?: boolean;
}

// ============= DEALS =============
export interface Deal {
  id: string;
  title: string;
  account: Account | string;
  contact?: Contact | string | null;
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
  } | string | null;
  stage: DealStage | string;
  value_eur?: number | null;
  probability?: number | null;
  expected_close_date?: string | null;
  notes?: string | null;
  archived_at?: string | null;
  date_created?: string;
  date_updated?: string;
  user_created?: string;
  user_updated?: string;
}

// ============= DEAL ITEMS =============
export interface DealItem {
  id: string;
  deal: Deal | string;
  package: {
    id: string;
    name: string;
    base_price?: number | null;
  } | string;
  quantity?: number;
  unit_price?: number;
  notes?: string | null;
  date_created?: string;
  date_updated?: string;
  user_created?: string;
  user_updated?: string;
}

// ============= ACTIVITIES =============
export interface Activity {
  id: string;
  subject: string;
  type?: 'call' | 'meeting' | 'email' | 'follow_up' | 'note' | null;
  description?: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  deal?: string | null;
  account?: string | null;
  contact?: string | null;
  owner: {
    id: string;
    first_name: string;
    last_name: string;
  } | string;
  archived_at?: string | null;
  date_created?: string;
  date_updated?: string;
  user_created?: string;
  user_updated?: string;
}

// ============= TYPES PARA COMPONENTES =============

// Deal con relaciones expandidas (para listas)
export interface DealWithRelations {
  id: string;
  title: string;
  value_eur: number | null;
  probability: number;
  expected_close_date: string | null;
  account: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  stage: {
    id: string;
    key: string;
    label: string;
  };
  date_created: string;
}

// Contact con relaciones expandidas
export interface ContactWithRelations extends Contact {
  // Agregar relaciones cuando sea necesario
}

// Account con relaciones expandidas
export interface AccountWithRelations extends Account {
  // Agregar relaciones cuando sea necesario
}