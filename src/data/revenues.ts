import { SaleRevenueItem, RentalRevenueItem, MediaRevenueItem } from '@/types';

// M Invest — Sale transactions (MRE property purchases)
export const defaultSaleRevenues: SaleRevenueItem[] = [
  {
    label: 'Casablanca',
    priceM2: 18000,
    area: 120,
    avgPrice: 2160000,
    commRate: 0.025,
    commRateLabel: '2.5%',
    revPerConv: 54000,
    y1: { conv: 1, total: 54000 },
    y2: { conv: 2, total: 108000 },
    y3: { conv: 3, total: 162000 },
  },
  {
    label: 'Marrakech',
    priceM2: 15000,
    area: 120,
    avgPrice: 1800000,
    commRate: 0.025,
    commRateLabel: '2.5%',
    revPerConv: 45000,
    y1: { conv: 0, total: 0 },
    y2: { conv: 1, total: 45000 },
    y3: { conv: 2, total: 90000 },
  },
  {
    label: 'Rabat',
    priceM2: 17000,
    area: 120,
    avgPrice: 2040000,
    commRate: 0.025,
    commRateLabel: '2.5%',
    revPerConv: 51000,
    y1: { conv: 1, total: 51000 },
    y2: { conv: 1, total: 51000 },
    y3: { conv: 2, total: 102000 },
  },
  {
    label: 'Autre',
    priceM2: 14000,
    area: 150,
    avgPrice: 2100000,
    commRate: 0.025,
    commRateLabel: '2.5%',
    revPerConv: 52500,
    y1: { conv: 0, total: 0 },
    y2: { conv: 1, total: 52500 },
    y3: { conv: 1, total: 52500 },
  },
];

// Feel Home — Long-term rental placements for expatriates
export const defaultRentalRevenues: RentalRevenueItem[] = [
  {
    label: 'Casablanca',
    rent: 15000,
    commFactor: 1.5,
    commFactorLabel: '1.5 mo',
    revPerConv: 22500,
    y1: { conv: 4, total: 90000 },
    y2: { conv: 6, total: 135000 },
    y3: { conv: 8, total: 180000 },
  },
  {
    label: 'Marrakech',
    rent: 14000,
    commFactor: 1.5,
    commFactorLabel: '1.5 mo',
    revPerConv: 21000,
    y1: { conv: 0, total: 0 },
    y2: { conv: 3, total: 63000 },
    y3: { conv: 6, total: 126000 },
  },
  {
    label: 'Rabat',
    rent: 12000,
    commFactor: 1.5,
    commFactorLabel: '1.5 mo',
    revPerConv: 18000,
    y1: { conv: 4, total: 72000 },
    y2: { conv: 6, total: 108000 },
    y3: { conv: 8, total: 144000 },
  },
  {
    label: 'Autre',
    rent: 12000,
    commFactor: 1.5,
    commFactorLabel: '1.5 mo',
    revPerConv: 18000,
    y1: { conv: 0, total: 0 },
    y2: { conv: 2, total: 36000 },
    y3: { conv: 4, total: 72000 },
  },
];

// Expats.ma — Media platform revenues
export const defaultMediaRevenues: MediaRevenueItem[] = [
  {
    label: 'Sponsored Articles',
    unitPrice: 3000,
    y1: { conv: 4, total: 12000 },
    y2: { conv: 8, total: 24000 },
    y3: { conv: 14, total: 42000 },
  },
  {
    label: 'Banner Ads (monthly)',
    unitPrice: 2000,
    y1: { conv: 2, total: 4000 },
    y2: { conv: 5, total: 10000 },
    y3: { conv: 10, total: 20000 },
  },
  {
    label: 'Premium Membership',
    unitPrice: 200,
    y1: { conv: 50, total: 10000 },
    y2: { conv: 150, total: 30000 },
    y3: { conv: 400, total: 80000 },
  },
  {
    label: 'Events & Workshops',
    unitPrice: 5000,
    y1: { conv: 2, total: 10000 },
    y2: { conv: 4, total: 20000 },
    y3: { conv: 6, total: 30000 },
  },
];
