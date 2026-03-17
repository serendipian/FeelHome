import type { BrandKey } from '@/types';
import type { MarketKey } from '@/context/FinancialContext';

export type IconKey =
  | 'people' | 'gear' | 'diamond' | 'handshake' | 'chart' | 'report'
  | 'inbox' | 'globe' | 'megaphone' | 'calendar' | 'chat' | 'camera'
  | 'search' | 'phone' | 'filter' | 'database' | 'refresh' | 'building'
  | 'target';

export type CommissionType = 'All Revenues' | 'Linked Deals' | 'No Commission';

export interface SerializableResponsibility {
  iconKey: IconKey;
  label: string;
}

/** Persisted to Supabase */
export interface TeamMemberData {
  id: string;
  title: string;
  contract: 'CDI' | 'CDD' | 'Freelance';
  startMonth: number;
  languages: string[];
  schedule: { days: string; hours: string; status: 'Full-time' | 'Part-time' };
  expenseLabel: string;
  brands?: BrandKey[];
  market?: MarketKey;
  responsibilities: SerializableResponsibility[];
  skills: string[];
  kpis: { label: string; target: string }[];
  tools: string[];
  commission: { rate: number; type: CommissionType };
}

/** Static display props — NOT persisted, kept in code */
export interface TeamMemberDisplay {
  id: string;
  initials: string;
  color: string;
  subtitle?: string;
  tagline?: string;
  scope?: string;
  location?: string;
}
