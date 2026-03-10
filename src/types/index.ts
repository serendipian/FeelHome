export type BrandKey = 'feelHome' | 'mInvest' | 'expats';

export interface Brand {
  key: BrandKey;
  name: string;
  shortName: string;
  description: string;
  color: string;
  logo?: string;
  initials: string;
}

export interface SaleRevenueItem {
  label: string;
  priceM2: number;
  area: number;
  avgPrice: number;
  commRate: number;
  commRateLabel: string;
  revPerConv: number;
  y1: { conv: number; total: number };
  y2: { conv: number; total: number };
  y3: { conv: number; total: number };
}

export interface RentalRevenueItem {
  label: string;
  rent: number;
  commFactor: number;
  commFactorLabel: string;
  revPerConv: number;
  y1: { conv: number; total: number };
  y2: { conv: number; total: number };
  y3: { conv: number; total: number };
}

export interface MediaRevenueItem {
  label: string;
  unitPrice: number;
  y1: { conv: number; total: number };
  y2: { conv: number; total: number };
  y3: { conv: number; total: number };
}

export interface ExpenseItem {
  label: string;
  category: 'salaries' | 'fixed' | 'marketing';
  y1: number;
  y2: number;
  y3: number;
  brands: BrandKey[];
}

export interface YearlyFinancials {
  revenue: number;
  commissions: number;
  expenses: number;
  profit: number;
}

export interface MonthlySnapshot {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
  cumulative: number;
  balance: number;
}
