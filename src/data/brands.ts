import { Brand } from '@/types';

export const brands: Record<string, Brand> = {
  feelHome: {
    key: 'feelHome',
    name: 'Feel Home',
    shortName: 'FH',
    description: 'Rental Agency',
    color: '#d4875a',
    logo: 'https://media.licdn.com/dms/image/v2/D4E0BAQGiSdDJ-We0Ig/company-logo_200_200/company-logo_200_200/0/1712537881210/feel_home_morocco_logo?e=2147483647&v=beta&t=mxKEy_sdp8-RhtNyMyAxF_c5ZaxOeXmkt8SRzGv92F8',
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
    color: '#7c6bf4',
    logo: 'https://media.licdn.com/dms/image/v2/D4E0BAQF_FPzVxm3tMw/company-logo_100_100/company-logo_100_100/0/1733782692982/top_web3_jobs_logo?e=1774483200&v=beta&t=WaF_fN2IdzylPxHBjhzDaWhwzZqQMTNzw54-HndHup8',
    initials: 'EX',
  },
};

export const brandKeys = ['feelHome', 'mInvest', 'expats'] as const;
