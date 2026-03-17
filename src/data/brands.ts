import { Brand } from '@/types';

export const brands: Record<string, Brand> = {
  feelHome: {
    key: 'feelHome',
    name: 'Feel Home',
    shortName: 'FH',
    description: 'Rental Agency',
    color: '#d4875a',
    logo: '/logos/feelhome.jpg',
    initials: 'FH',
  },
  mInvest: {
    key: 'mInvest',
    name: 'M Invest',
    shortName: 'MI',
    description: 'Buy/Sell Agency',
    color: '#5b8ec9',
    initials: 'MI',
  },
  expats: {
    key: 'expats',
    name: 'Expats.ma',
    shortName: 'EX',
    description: 'Media Platform',
    color: '#1d7ff3',
    logo: '/logos/expats.jpg',
    initials: 'EX',
  },
};

export const brandKeys = ['feelHome', 'mInvest', 'expats'] as const;
