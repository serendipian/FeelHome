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
  { id: 'seo-fr', category: 'seo', label: 'SEO Français', imageType: 'logo', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png', leadsPerMonth: 0 },
  { id: 'seo-en', category: 'seo', label: 'SEO Anglais', imageType: 'logo', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png', leadsPerMonth: 0 },
  // Médias
  { id: 'media-expats', category: 'medias', label: 'Expats.ma', imageType: 'laptop', imageUrl: '/images/leads/expats-ma.png', leadsPerMonth: 0 },
  { id: 'media-guide', category: 'medias', label: 'Guideimmobilier.ma', imageType: 'laptop', imageUrl: '/images/leads/guide-immobilier.png', leadsPerMonth: 0 },
  // Facebook Groups
  { id: 'fb-expats-morocco', category: 'fbGroups', label: 'Expats Morocco', sublabel: '34K', imageType: 'cover', imageUrl: '/images/leads/expats-morocco.jpeg', leadsPerMonth: 0 },
  { id: 'fb-francais-maroc', category: 'fbGroups', label: 'Français du Maroc', sublabel: '37K', imageType: 'cover', imageUrl: '/images/leads/francais-du-maroc.jpeg', leadsPerMonth: 0 },
  { id: 'fb-reseau-expatries', category: 'fbGroups', label: 'Réseau des Expatriés au Maroc', sublabel: '38K', imageType: 'cover', imageUrl: '/images/leads/reseau-expatries.jpeg', leadsPerMonth: 0 },
  { id: 'fb-francais-marrakech', category: 'fbGroups', label: 'Français de Marrakech', sublabel: '19K', imageType: 'cover', imageUrl: '/images/leads/francais-marrakech.jpeg', leadsPerMonth: 0 },
  { id: 'fb-expats-maroc', category: 'fbGroups', label: 'Expats Maroc', sublabel: '11K', imageType: 'cover', imageUrl: '/images/leads/expats-maroc.jpeg', leadsPerMonth: 0 },
  { id: 'fb-bouskouristes', category: 'fbGroups', label: 'Les Bouskouristes', sublabel: '14K', imageType: 'cover', imageUrl: 'https://consonews.ma/wp-content/uploads/2017/11/bouskoura-green-city.jpg', leadsPerMonth: 0 },
  // Social Media Pages
  { id: 'sm-facebook', category: 'socialMedia', label: 'Facebook', imageType: 'logo', imageUrl: 'https://cdn.simpleicons.org/facebook', leadsPerMonth: 0 },
  { id: 'sm-instagram', category: 'socialMedia', label: 'Instagram', imageType: 'logo', imageUrl: 'https://play-lh.googleusercontent.com/VRMWkE5p3CkWhJs6nv-9ZsLAs1QOg5ob1_3qg-rckwYW7yp1fMrYZqnEFpk0IoVP4LM', leadsPerMonth: 0 },
  { id: 'sm-youtube', category: 'socialMedia', label: 'Youtube', imageType: 'logo', imageUrl: 'https://cdn.simpleicons.org/youtube', leadsPerMonth: 0 },
  { id: 'sm-linkedin', category: 'socialMedia', label: 'Linkedin', imageType: 'logo', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaJIA1rBpGY6WZMsgR0EjwaOxkL2oGvyqmIA&s', leadsPerMonth: 0 },
  // Publicité
  { id: 'ads-facebook', category: 'ads', label: 'Meta Ads', imageType: 'logo', imageUrl: 'https://images.rawpixel.com/image_png_social_square/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdjEwOTEtMDRfMS5wbmc.png', leadsPerMonth: 0 },
  { id: 'ads-google', category: 'ads', label: 'Google Ads', imageType: 'logo', imageUrl: 'https://www.clipartmax.com/png/middle/326-3265266_google-ads-logo-png-google-ads-icon.png', leadsPerMonth: 0 },
  // Websites
  { id: 'web-fh', category: 'websites', label: 'Feel Home', sublabel: 'FR + EN', imageType: 'laptop', imageUrl: '/images/leads/feel-home-website.png', leadsPerMonth: 0 },
  { id: 'web-mi', category: 'websites', label: 'M Invest', sublabel: 'FR + EN', imageType: 'laptop', leadsPerMonth: 0 },
  // Partenaires
  { id: 'partner-agencies', category: 'partners', label: 'Agencies', imageType: 'icon', emoji: '🏢', leadsPerMonth: 0 },
  { id: 'partner-companies', category: 'partners', label: 'Companies', imageType: 'icon', emoji: '💼', leadsPerMonth: 0 },
  { id: 'partner-embassies', category: 'partners', label: 'Embassies', imageType: 'icon', emoji: '🏛️', leadsPerMonth: 0 },
  // MLS
  { id: 'mls-mubawab', category: 'mls', label: 'Mubawab', imageType: 'logo', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaXq1z9J_jbq9IL3rtge-ux6tMWkDEzjpOOg&s', leadsPerMonth: 0 },
  { id: 'mls-agenz', category: 'mls', label: 'AgenZ', imageType: 'logo', imageUrl: 'https://www.google.com/s2/favicons?domain=agenz.ma&sz=128', leadsPerMonth: 0 },
  // LLM
  { id: 'llm-chatgpt', category: 'llm', label: 'ChatGPT', imageType: 'logo', imageUrl: 'https://static.vecteezy.com/system/resources/thumbnails/021/059/825/small/chatgpt-logo-chat-gpt-icon-on-green-background-free-vector.jpg', leadsPerMonth: 0 },
  { id: 'llm-gemini', category: 'llm', label: 'Gemini', imageType: 'logo', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Google_Gemini_icon_2025.svg/500px-Google_Gemini_icon_2025.svg.png', leadsPerMonth: 0 },
];

export const DEFAULT_CHANNELS: LeadChannel[] = [
  { id: 'email', label: 'Email', icon: '📧', imageUrl: 'https://static.vecteezy.com/system/resources/previews/022/613/021/non_2x/google-mail-gmail-icon-logo-symbol-free-png.png', leadsPerMonth: 0 },
  { id: 'webform', label: 'Website Forms', icon: '📋', imageUrl: 'https://wpforms.com/wp-content/uploads/cache/integrations/b54de7beaf1455d6550dde9a40862615.png', leadsPerMonth: 0 },
  { id: 'adsform', label: 'Ads Lead Form', icon: '📋', imageUrl: 'https://cdn.shopify.com/app-store/listing_images/64aea8fac61031bdf9a121e2e7a6550b/icon/CIWK4p7rp4oDEAE=.png', leadsPerMonth: 0 },
  { id: 'wamsg', label: 'WhatsApp Message', icon: '💬', imageUrl: 'https://img.favpng.com/16/3/10/whatsapp-logo-png-favpng-NbGyiBb9eGw54Ez58YzAAedwX.jpg', leadsPerMonth: 0 },
  { id: 'igmsg', label: 'Instagram Message', icon: '📱', imageUrl: 'https://play-lh.googleusercontent.com/VRMWkE5p3CkWhJs6nv-9ZsLAs1QOg5ob1_3qg-rckwYW7yp1fMrYZqnEFpk0IoVP4LM', leadsPerMonth: 0 },
  { id: 'fbmsg', label: 'Facebook Message', icon: '💬', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/960px-Facebook_Messenger_logo_2020.svg.png', leadsPerMonth: 0 },
  { id: 'wacall', label: 'WhatsApp Call', icon: '📞', imageUrl: 'https://img.favpng.com/16/3/10/whatsapp-logo-png-favpng-NbGyiBb9eGw54Ez58YzAAedwX.jpg', leadsPerMonth: 0 },
  { id: 'directcall', label: 'Direct Call', icon: '📞', imageUrl: 'https://www.clipartmax.com/png/small/157-1575746_metroui-other-phone-alt-icon-pictures-png-images-phone-call-logo.png', leadsPerMonth: 0 },
  { id: 'mlsform', label: 'MLS Form', icon: '📋', leadsPerMonth: 0 },
];

export const DEFAULT_TEAM: PipelineTeamMember[] = [
  { id: 'director', label: 'Director', initials: 'YB', role: 'Calls only', received: 0, qualified: 0, rate: 50 },
  { id: 'digital', label: 'Digital Coordinator', initials: 'DC', role: 'Digital channels', received: 0, qualified: 0, rate: 50 },
  { id: 'agents', label: 'Agents', initials: 'AG', role: 'Field agents', received: 0, qualified: 0, rate: 10 },
  { id: 'hunter', label: 'Property Hunter', initials: 'PH', role: 'Property search', received: 0, qualified: 0, rate: 10 },
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
