import type {
  LeadSource,
  LeadChannel,
  PipelineTeamMember,
  DealSigner,
  PipelineConnections,
  LeadsPipelineData,
} from '@/types/leads';

export const DEFAULT_SOURCES: LeadSource[] = [
  // SEO
  { id: 'seo-fr', category: 'seo', label: 'SEO Français', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'seo-en', category: 'seo', label: 'SEO Anglais', imageType: 'icon', leadsPerMonth: 0 },
  // Médias
  { id: 'media-expats', category: 'medias', label: 'Expats.ma', imageType: 'laptop', imageUrl: '/images/leads/expats-ma.png', leadsPerMonth: 0 },
  { id: 'media-guide', category: 'medias', label: 'Guideimmobilier.ma', imageType: 'laptop', imageUrl: '/images/leads/guide-immobilier.png', leadsPerMonth: 0 },
  // Facebook Groups
  { id: 'fb-expats-morocco', category: 'fbGroups', label: 'Expats Morocco', sublabel: '45K', imageType: 'cover', imageUrl: '/images/leads/expats-morocco.jpeg', leadsPerMonth: 0 },
  { id: 'fb-francais-maroc', category: 'fbGroups', label: 'Français du Maroc', sublabel: '38K', imageType: 'cover', imageUrl: '/images/leads/francais-du-maroc.jpeg', leadsPerMonth: 0 },
  { id: 'fb-reseau-expatries', category: 'fbGroups', label: 'Réseau des Expatriés au Maroc', sublabel: '22K', imageType: 'cover', imageUrl: '/images/leads/reseau-expatries.jpeg', leadsPerMonth: 0 },
  { id: 'fb-francais-marrakech', category: 'fbGroups', label: 'Français de Marrakech', sublabel: '15K', imageType: 'cover', imageUrl: '/images/leads/francais-marrakech.jpeg', leadsPerMonth: 0 },
  { id: 'fb-expats-maroc', category: 'fbGroups', label: 'Expats Maroc', sublabel: '30K', imageType: 'cover', imageUrl: '/images/leads/expats-maroc.jpeg', leadsPerMonth: 0 },
  { id: 'fb-bouskouristes', category: 'fbGroups', label: 'Les Bouskouristes', sublabel: '8K', imageType: 'icon', leadsPerMonth: 0 },
  // Social Media Pages
  { id: 'sm-facebook', category: 'socialMedia', label: 'Facebook', imageType: 'logo', leadsPerMonth: 0 },
  { id: 'sm-instagram', category: 'socialMedia', label: 'Instagram', imageType: 'logo', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-LEWI88wVZBQZ4YmnUfwXBQb02j8DbJL--g&s', leadsPerMonth: 0 },
  { id: 'sm-youtube', category: 'socialMedia', label: 'Youtube', imageType: 'logo', leadsPerMonth: 0 },
  { id: 'sm-linkedin', category: 'socialMedia', label: 'Linkedin', imageType: 'logo', leadsPerMonth: 0 },
  // Publicité
  { id: 'ads-facebook', category: 'ads', label: 'Facebook Ads', imageType: 'logo', leadsPerMonth: 0 },
  { id: 'ads-google', category: 'ads', label: 'Google Ads', imageType: 'logo', leadsPerMonth: 0 },
  // Websites
  { id: 'web-fh', category: 'websites', label: 'Feel Home', sublabel: 'FR + EN', imageType: 'laptop', imageUrl: '/images/leads/feel-home-website.png', leadsPerMonth: 0 },
  { id: 'web-mi', category: 'websites', label: 'M Invest', sublabel: 'FR + EN', imageType: 'laptop', leadsPerMonth: 0 },
  // Partenaires
  { id: 'partner-agencies', category: 'partners', label: 'Agences/Agents', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'partner-companies', category: 'partners', label: 'Sociétés', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'partner-embassies', category: 'partners', label: 'Ambassades/Consulats', imageType: 'icon', leadsPerMonth: 0 },
  // MLS
  { id: 'mls-mubawab', category: 'mls', label: 'Mubawab', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'mls-agenz', category: 'mls', label: 'AgenZ', imageType: 'icon', leadsPerMonth: 0 },
  // LLM
  { id: 'llm-chatgpt', category: 'llm', label: 'ChatGPT', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'llm-gemini', category: 'llm', label: 'Gemini', imageType: 'icon', leadsPerMonth: 0 },
];

export const DEFAULT_CHANNELS: LeadChannel[] = [
  { id: 'email', label: 'Email', icon: '📧', leadsPerMonth: 0 },
  { id: 'webform', label: 'Website Form', icon: '📋', leadsPerMonth: 0 },
  { id: 'adsform', label: 'Ads Lead Form', icon: '📋', leadsPerMonth: 0 },
  { id: 'wamsg', label: 'WhatsApp Message', icon: '💬', leadsPerMonth: 0 },
  { id: 'igmsg', label: 'Instagram Message', icon: '📱', leadsPerMonth: 0 },
  { id: 'fbmsg', label: 'Facebook Message', icon: '💬', leadsPerMonth: 0 },
  { id: 'wacall', label: 'WhatsApp Call', icon: '📞', leadsPerMonth: 0 },
  { id: 'directcall', label: 'Direct Call', icon: '📞', leadsPerMonth: 0 },
  { id: 'mlsform', label: 'MLS Form', icon: '📋', leadsPerMonth: 0 },
];

export const DEFAULT_TEAM: PipelineTeamMember[] = [
  { id: 'director', label: 'Director', initials: 'YB', role: 'Calls only', received: 0, qualified: 0 },
  { id: 'digital', label: 'Digital Coordinator', initials: 'DC', role: 'Digital channels', received: 0, qualified: 0 },
  { id: 'agents', label: 'Agents', initials: 'AG', role: 'Field agents', received: 0, qualified: 0 },
  { id: 'hunter', label: 'Property Hunter', initials: 'PH', role: 'Property search', received: 0, qualified: 0 },
];

export const DEFAULT_DEAL_SIGNERS: DealSigner[] = [
  { id: 'signer_director', label: 'Director', dealsSigned: 0 },
  { id: 'signer_agents', label: 'Agents', dealsSigned: 0 },
];

export const DEFAULT_CONNECTIONS: PipelineConnections = {
  sourcesToWebsites: ['seo', 'llm', 'medias', 'fbGroups', 'socialMedia', 'ads'],
  websitesToChannels: ['webform', 'wamsg', 'wacall', 'directcall'],
  partnersToChannels: ['directcall', 'email'],
  adsToChannels: ['email', 'webform', 'adsform', 'wamsg', 'igmsg', 'fbmsg', 'wacall', 'directcall'],
  mlsToChannels: ['directcall', 'wacall', 'mlsform'],
  llmToChannels: ['directcall', 'wamsg', 'email'],
  channelsToDirector: ['directcall', 'wacall'],
  channelsToDigital: ['webform', 'adsform', 'wamsg', 'email', 'igmsg', 'fbmsg'],
};

export const DEFAULT_LEADS_DATA: LeadsPipelineData = {
  sources: DEFAULT_SOURCES,
  channels: DEFAULT_CHANNELS,
  team: DEFAULT_TEAM,
  dealSigners: DEFAULT_DEAL_SIGNERS,
  connections: DEFAULT_CONNECTIONS,
};
