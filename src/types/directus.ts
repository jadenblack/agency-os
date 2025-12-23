// Auto-generated Directus Schema Types
// Generated on: 2025-12-21T16:34:56.593Z

export interface DirectusSchema {
  account_members: account_membersItem[];
  account_services: account_servicesItem[];
  accounts: accountsItem[];
  activities: activitiesItem[];
  app_settings: app_settingsItem[];
  chat_channel_members: chat_channel_membersItem[];
  chat_channels: chat_channelsItem[];
  chat_messages: chat_messagesItem[];
  contacts: contactsItem[];
  countries: countriesItem[];
  deal_items: deal_itemsItem[];
  deal_stages: deal_stagesItem[];
  deals: dealsItem[];
  docs_pages: docs_pagesItem[];
  docs_spaces: docs_spacesItem[];
  kb_articles: kb_articlesItem[];
  kb_articles_services: kb_articles_servicesItem[];
  kb_articles_services_1: kb_articles_services_1Item[];
  kb_categories: kb_categoriesItem[];
  milestones: milestonesItem[];
  priorities: prioritiesItem[];
  projects: projectsItem[];
  service_packages: service_packagesItem[];
  services: servicesItem[];
  statuses: statusesItem[];
  task_time_entries: task_time_entriesItem[];
  tasks: tasksItem[];
  team_members: team_membersItem[];
  teams: teamsItem[];
  ticket_categories: ticket_categoriesItem[];
  tickets: ticketsItem[];
  tickets_messages: tickets_messagesItem[];
}

export interface account_membersItem {
  id: string;
  account: accountsItem | string;
  user?: directus_usersItem | string | null;
  is_primary?: boolean | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  job_title?: string | null;
  contact?: contactsItem | string | null;
  role_in_portal?: string | null;
}

export interface account_servicesItem {
  id: string;
  status: string;
  user_created?: directus_usersItem | string | null;
  date_created?: string | null;
  user_updated?: directus_usersItem | string | null;
  date_updated?: string | null;
  account: accountsItem | string;
  package: service_packagesItem | string;
  star_date?: string | null;
  end_date?: string | null;
  price?: number | null;
  notes?: string | null;
}

export interface accountsItem {
  id: string;
  name?: string | null;
  status?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  notes?: string | null;
  archived_at?: any | null;
  address?: string | null;
  city?: string | null;
  zip_code?: string | null;
  state?: string | null;
  tax_id?: string | null;
  country?: countriesItem | string | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  legal_name?: string | null;
  account_owner?: directus_usersItem | string | null;
}

export interface activitiesItem {
  id: string;
  account?: accountsItem | string | null;
  deal?: dealsItem | string | null;
  contact?: contactsItem | string | null;
  owner: directus_usersItem | string;
  type?: string | null;
  subject?: string | null;
  description?: string | null;
  scheduled_at?: any | null;
  completed_at?: any | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface app_settingsItem {
  id: string;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  sort?: number | null;
}

export interface chat_channel_membersItem {
  id: string;
  user_created?: directus_usersItem | string | null;
  date_created?: string | null;
  user_updated?: directus_usersItem | string | null;
  date_updated?: string | null;
  channel?: chat_channelsItem | string | null;
  user?: directus_usersItem | string | null;
  role?: string | null;
  is_muted?: boolean | null;
}

export interface chat_channelsItem {
  id: string;
  user_created?: directus_usersItem | string | null;
  date_created?: string | null;
  user_updated?: directus_usersItem | string | null;
  date_updated?: string | null;
  name: string;
  type: string;
  team?: teamsItem | string | null;
  is_private?: boolean | null;
  is_active?: boolean | null;
}

export interface chat_messagesItem {
  id: string;
  user_created?: directus_usersItem | string | null;
  date_created?: string | null;
  user_updated?: directus_usersItem | string | null;
  date_updated?: string | null;
  channel?: chat_channelsItem | string | null;
  sender?: directus_usersItem | string | null;
  content?: string | null;
  message_type?: string | null;
  reply_to?: chat_messagesItem | string | null;
  is_deleted?: boolean | null;
}

export interface contactsItem {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  contact_role?: string | null;
}

export interface countriesItem {
  id: string;
  code?: string | null;
  name?: string | null;
  is_active?: boolean | null;
  sort?: number | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface deal_itemsItem {
  id: string;
  user_created?: directus_usersItem | string | null;
  date_created?: string | null;
  user_updated?: directus_usersItem | string | null;
  date_updated?: string | null;
  deal?: dealsItem | string | null;
  package?: service_packagesItem | string | null;
  quantity?: number | null;
  unit_price?: number | null;
  notes?: string | null;
}

export interface deal_stagesItem {
  id: string;
  key?: string | null;
  label?: string | null;
  sort?: number | null;
  is_won?: boolean | null;
  is_lost?: boolean | null;
  is_active?: boolean | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface dealsItem {
  id: string;
  account: accountsItem | string;
  contact?: contactsItem | string | null;
  owner?: directus_usersItem | string | null;
  stage: deal_stagesItem | string;
  title?: string | null;
  value_eur?: number | null;
  probability?: number | null;
  expected_close_date?: string | null;
  notes?: string | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface docs_pagesItem {
  id: string;
  space: docs_spacesItem | string;
  parent_page?: docs_pagesItem | string | null;
  status: string;
  slug?: string | null;
  body?: string | null;
  archived_at?: any | null;
  title?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  sort?: number | null;
}

export interface docs_spacesItem {
  id: string;
  team?: teamsItem | string | null;
  key?: string | null;
  name?: string | null;
  visibility?: string | null;
  sort?: number | null;
  is_active?: boolean | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  status?: string | null;
}

export interface kb_articlesItem {
  id: string;
  category?: kb_categoriesItem | string | null;
  account?: accountsItem | string | null;
  status: string;
  slug?: string | null;
  title?: string | null;
  body?: string | null;
  published_at?: any | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  sort?: number | null;
  services: any;
}

export interface kb_articles_servicesItem {
  id: number;
  kb_articles_id?: kb_articlesItem | string | null;
  services_id?: servicesItem | string | null;
}

export interface kb_articles_services_1Item {
  id: number;
  kb_articles_id?: kb_articlesItem | string | null;
  services_id?: servicesItem | string | null;
}

export interface kb_categoriesItem {
  id: string;
  key?: string | null;
  label?: string | null;
  sort?: number | null;
  is_active?: boolean | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  status: string;
}

export interface milestonesItem {
  id: string;
  project: projectsItem | string;
  status: statusesItem | string;
  name?: string | null;
  description?: string | null;
  due_date?: string | null;
  sort?: number | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface prioritiesItem {
  id: string;
  key?: string | null;
  label?: string | null;
  scope?: string | null;
  sort?: number | null;
  is_active?: boolean | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface projectsItem {
  id: string;
  account?: accountsItem | string | null;
  owner?: directus_usersItem | string | null;
  status: statusesItem | string;
  name?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  package?: service_packagesItem | string | null;
}

export interface service_packagesItem {
  id: string;
  sort?: number | null;
  user_created?: directus_usersItem | string | null;
  date_created?: string | null;
  user_updated?: directus_usersItem | string | null;
  date_updated?: string | null;
  service?: servicesItem | string | null;
  name?: string | null;
  code: string;
  description?: string | null;
  base_price?: number | null;
  billing_model?: string | null;
  is_active?: boolean | null;
}

export interface servicesItem {
  id: string;
  sort?: number | null;
  user_created?: directus_usersItem | string | null;
  date_created?: string | null;
  user_updated?: directus_usersItem | string | null;
  date_updated?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean | null;
}

export interface statusesItem {
  id: string;
  key?: string | null;
  label?: string | null;
  scope?: string | null;
  sort?: number | null;
  is_final?: boolean | null;
  is_active?: boolean | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface task_time_entriesItem {
  id: string;
  task: tasksItem | string;
  user: directus_usersItem | string;
  date?: string | null;
  minutes?: number | null;
  notes?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface tasksItem {
  id: string;
  project: projectsItem | string;
  status: statusesItem | string;
  priority: prioritiesItem | string;
  assignee?: directus_usersItem | string | null;
  owner?: directus_usersItem | string | null;
  parent_task?: tasksItem | string | null;
  title?: string | null;
  description?: string | null;
  due_date?: string | null;
  estimated_minutes?: number | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface team_membersItem {
  id: string;
  team: teamsItem | string;
  user: directus_usersItem | string;
  role?: string | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface teamsItem {
  id: string;
  key?: string | null;
  name?: string | null;
  is_active?: boolean | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  sort?: number | null;
}

export interface ticket_categoriesItem {
  id: string;
  key?: string | null;
  label?: string | null;
  sort?: number | null;
  is_active?: boolean | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

export interface ticketsItem {
  id: string;
  account?: accountsItem | string | null;
  assigned_to?: directus_usersItem | string | null;
  status: statusesItem | string;
  priority: prioritiesItem | string;
  category?: ticket_categoriesItem | string | null;
  subject?: string | null;
  description?: string | null;
  channel?: string | null;
  first_response_at?: any | null;
  resolved_at?: any | null;
  last_customer_reply_at?: any | null;
  last_agent_reply_at?: any | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
  requester_contact?: contactsItem | string | null;
  package?: service_packagesItem | string | null;
  attachments?: directus_filesItem | string | null;
}

export interface tickets_messagesItem {
  id: string;
  ticket: ticketsItem | string;
  author?: directus_usersItem | string | null;
  body?: string | null;
  is_internal?: boolean | null;
  source?: string | null;
  archived_at?: any | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: directus_usersItem | string | null;
  user_updated?: directus_usersItem | string | null;
}

// Directus System Types
export interface directus_usersItem {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  password?: string | null;
  location?: string | null;
  title?: string | null;
  description?: string | null;
  tags?: any | null;
  avatar?: string | null;
  language?: string | null;
  theme?: string | null;
  tfa_secret?: string | null;
  status?: string | null;
  role?: string | null;
  token?: string | null;
  last_access?: string | null;
  last_page?: string | null;
}

export interface directus_filesItem {
  id: string;
  storage: string;
  filename_disk?: string | null;
  filename_download: string;
  title?: string | null;
  type?: string | null;
  folder?: string | null;
  uploaded_by?: string | null;
  uploaded_on: string;
  modified_by?: string | null;
  modified_on: string;
  charset?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  embed?: string | null;
  description?: string | null;
  location?: string | null;
  tags?: any | null;
  metadata?: any | null;
}
