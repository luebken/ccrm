export interface BaseEntity {
  hubspot_id?: string;
  owner: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Contact extends BaseEntity {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  title?: string;
  company?: string;
  companies?: string[];
  opportunities?: string[];
  last_contacted?: string;
}

export interface Company extends BaseEntity {
  name: string;
  domain?: string;
  industry?: string;
  size?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  revenue?: string;
  type: 'prospect' | 'customer' | 'partner' | 'vendor' | 'other';
  contacts?: string[];
  opportunities?: string[];
  phone?: string;
  address?: string;
}

export interface Opportunity extends BaseEntity {
  name: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  amount?: number;
  probability?: number;
  expected_close_date?: string;
  company: string;
  contacts?: string[];
  primary_contact?: string;
  type: 'new-business' | 'renewal' | 'upsell' | 'cross-sell';
  closed_at?: string;
  lost_reason?: 'competitor' | 'budget' | 'timing' | 'other';
}

export interface Activity extends BaseEntity {
  type: 'meeting' | 'call' | 'email' | 'note' | 'task';
  subject: string;
  date: string;
  duration?: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  contacts?: string[];
  company?: string;
  opportunity?: string;
  outcome?: string;
  next_action?: string;
}

export type EntityType = 'contact' | 'company' | 'opportunity' | 'activity';
export type Entity = Contact | Company | Opportunity | Activity;

export interface ParsedEntity {
  type: EntityType;
  filename: string;
  frontmatter: Entity;
  content: string;
  filepath: string;
}