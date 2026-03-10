import { SaleRevenueItem, RentalRevenueItem, MediaRevenueItem } from '@/types';

// M Invest — Sale transactions (MRE property purchases)
export const saleRevenues: SaleRevenueItem[] = [
  {
    label: 'Casablanca',
    priceM2: 15000,
    area: 80,
    avgPrice: 1200000,
    commRate: 0.025,
    commRateLabel: '2.5%',
    revPerConv: 30000,
    y1: { conv: 6, total: 180000 },
    y2: { conv: 10, total: 300000 },
    y3: { conv: 16, total: 480000 },
  },
  {
    label: 'Marrakech',
    priceM2: 12000,
    area: 100,
    avgPrice: 1200000,
    commRate: 0.025,
    commRateLabel: '2.5%',
    revPerConv: 30000,
    y1: { conv: 4, total: 120000 },
    y2: { conv: 8, total: 240000 },
    y3: { conv: 12, total: 360000 },
  },
  {
    label: 'Rabat',
    priceM2: 14000,
    area: 85,
    avgPrice: 1190000,
    commRate: 0.025,
    commRateLabel: '2.5%',
    revPerConv: 29750,
    y1: { conv: 3, total: 89250 },
    y2: { conv: 6, total: 178500 },
    y3: { conv: 10, total: 297500 },
  },
];

// Feel Home — Long-term rental placements for expatriates
export const rentalRevenues: RentalRevenueItem[] = [
  {
    label: 'Casablanca',
    rent: 12000,
    commFactor: 1.5,
    commFactorLabel: '1.5 mo',
    revPerConv: 18000,
    y1: { conv: 10, total: 180000 },
    y2: { conv: 18, total: 324000 },
    y3: { conv: 28, total: 504000 },
  },
  {
    label: 'Marrakech',
    rent: 10000,
    commFactor: 1.5,
    commFactorLabel: '1.5 mo',
    revPerConv: 15000,
    y1: { conv: 6, total: 90000 },
    y2: { conv: 12, total: 180000 },
    y3: { conv: 20, total: 300000 },
  },
  {
    label: 'Rabat',
    rent: 11000,
    commFactor: 1.5,
    commFactorLabel: '1.5 mo',
    revPerConv: 16500,
    y1: { conv: 4, total: 66000 },
    y2: { conv: 8, total: 132000 },
    y3: { conv: 14, total: 231000 },
  },
];

// Expats.ma — Media platform revenues
export const mediaRevenues: MediaRevenueItem[] = [
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
