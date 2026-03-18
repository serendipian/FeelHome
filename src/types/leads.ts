export type SourceCategory =
  | 'seo'
  | 'medias'
  | 'fbGroups'
  | 'socialMedia'
  | 'ads'
  | 'websites'
  | 'partners'
  | 'mls'
  | 'llm';

export type ImageType = 'laptop' | 'logo' | 'icon' | 'cover';

export interface LeadSource {
  id: string;
  category: SourceCategory;
  label: string;
  sublabel?: string;
  imageUrl?: string;
  imageType: ImageType;
  emoji?: string;
  leadsPerMonth: number;
}

export interface LeadChannel {
  id: string;
  label: string;
  icon: string;
  imageUrl?: string;
  leadsPerMonth: number;
}

export interface PipelineTeamMember {
  id: string;
  label: string;
  initials: string;
  role: string;
  received: number;
  qualified: number;
  rate: number; // percentage 0-100
}

export interface DealSigner {
  id: string;
  label: string;
  dealsSigned: number;
}

export interface PipelineConnections {
  sourcesToWebsites: SourceCategory[];
  websitesToChannels: string[];
  partnersToChannels: string[];
  adsToChannels: string[];
  mlsToChannels: string[];
  llmToChannels: string[];
  channelsToDirector: string[];
  channelsToDigital: string[];
}

export interface LeadsPipelineData {
  sources: LeadSource[];
  channels: LeadChannel[];
  team: PipelineTeamMember[];
  dealSigners: DealSigner[];
  connections: PipelineConnections;
}
