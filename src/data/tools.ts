export type ToolCategory = 'Communication' | 'Website' | 'SaaS' | 'MLS' | 'Social Media' | 'Communities' | 'Ads';

export type ToolStatus = 'active' | 'inactive' | 'pending';
export type Currency = 'MAD' | 'USD' | 'EUR';

export interface ToolItem {
  id: string;
  category: ToolCategory;
  name: string;
  description: string;
  responsible: string;
  otherUsers: string[];
  monthlyCost: number;
  currency: Currency;
  username: string;
  password: string;
  status: ToolStatus;
}

export const TEAM_ROLES = [
  'Director',
  'Digital Manager',
  'Community Manager',
  'Property Hunter',
  'Agent',
];

export const CATEGORY_COLORS: Record<ToolCategory, string> = {
  Communication: '#3b82f6',
  Website: '#8b5cf6',
  SaaS: '#10b981',
  MLS: '#ef4444',
  'Social Media': '#ec4899',
  Communities: '#06b6d4',
  Ads: '#f59e0b',
};

export const DEFAULT_TOOLS: ToolItem[] = [
  // ── Communication ──
  { id: 'tel-main', category: 'Communication', name: 'Maroc Telecom — Main', description: 'Main phone number (0661 977 267)', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '0661 977 267', password: '', status: 'active' },
  { id: 'tel-agent', category: 'Communication', name: 'Maroc Telecom — Agent', description: 'Agent phone number', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '0661 ...', password: '', status: 'active' },
  { id: 'whatsapp', category: 'Communication', name: 'WhatsApp Business', description: 'Business messaging (0661 977 267)', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '0661 977 267', password: '', status: 'active' },
  { id: 'gmail', category: 'Communication', name: 'Gmail', description: 'Email communications', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: 'feelhome.ma@gmail.com', password: '', status: 'active' },
  { id: 'outlook', category: 'Communication', name: 'Outlook', description: 'Professional email', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: 'contact@feelhome.ma', password: '', status: 'active' },

  // ── Website ──
  { id: 'webflow', category: 'Website', name: 'Webflow', description: 'Website builder & CMS', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'USD', username: '', password: '', status: 'active' },
  { id: 'jotform', category: 'Website', name: 'Jotform', description: 'Online forms & surveys', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'USD', username: '', password: '', status: 'active' },
  { id: 'genious', category: 'Website', name: 'Genious', description: 'Domain name management', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'hostpapa', category: 'Website', name: 'Hostpapa', description: 'Web hosting provider', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'USD', username: '', password: '', status: 'active' },
  { id: 'analytics', category: 'Website', name: 'Google Analytics', description: 'Website traffic & analytics', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'USD', username: '', password: '', status: 'active' },
  { id: 'search-console', category: 'Website', name: 'Search Console', description: 'Search performance & indexing', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'USD', username: '', password: '', status: 'active' },

  // ── SaaS ──
  { id: 'google-drive', category: 'SaaS', name: 'Google Drive', description: 'File storage & organisation', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'notion', category: 'SaaS', name: 'Notion', description: 'CRM & project management', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'USD', username: '', password: '', status: 'active' },
  { id: 'openai', category: 'SaaS', name: 'OpenAI (ChatGPT)', description: 'AI assistant & content generation', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'USD', username: '', password: '', status: 'active' },
  { id: 'autoenhance', category: 'SaaS', name: 'AutoEnhance', description: 'AI-powered photo enhancement', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'USD', username: '', password: '', status: 'active' },
  { id: 'n8n', category: 'SaaS', name: 'N8n', description: 'Workflow automation', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'USD', username: '', password: '', status: 'active' },
  { id: 'canva', category: 'SaaS', name: 'Canva', description: 'Graphic design & templates', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'USD', username: '', password: '', status: 'active' },

  // ── MLS ──
  { id: 'mubawab', category: 'MLS', name: 'Mubawab', description: 'Property listing platform', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'avito', category: 'MLS', name: 'Avito', description: 'Classifieds & property listings', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },

  // ── Social Media ──
  { id: 'facebook', category: 'Social Media', name: 'Facebook', description: 'Groups & page management', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'instagram', category: 'Social Media', name: 'Instagram', description: 'Visual content & stories', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'youtube', category: 'Social Media', name: 'Youtube', description: 'Video content & tours', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'linkedin', category: 'Social Media', name: 'LinkedIn', description: 'Professional networking', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'tiktok', category: 'Social Media', name: 'TikTok', description: 'Short-form video content', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },

  // ── Communities (Facebook Groups) ──
  { id: 'community-expats-morocco', category: 'Communities', name: 'Expats Morocco', description: 'Facebook Group', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'community-francais-maroc', category: 'Communities', name: 'Français du Maroc', description: 'Facebook Group', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'community-reseau-expats', category: 'Communities', name: 'Réseau des Expatriés au Maroc', description: 'Facebook Group', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'community-francais-marrakech', category: 'Communities', name: 'Français de Marrakech', description: 'Facebook Group', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'community-expats-maroc', category: 'Communities', name: 'Expats Maroc', description: 'Facebook Group', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'inactive' },

  // ── Ads ──
  { id: 'fb-business', category: 'Ads', name: 'Facebook Business Manager', description: 'Facebook & Instagram ad campaigns', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
  { id: 'google-ads', category: 'Ads', name: 'Google Ads', description: 'Search & display advertising', responsible: '', otherUsers: [], monthlyCost: 0, currency: 'MAD', username: '', password: '', status: 'active' },
];
