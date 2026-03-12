// ─── Role definitions ────────────────────────────────────────────

export type RoleId = 'director' | 'digital-manager' | 'agent' | 'property-hunter' | 'community-manager';

export interface RoleMeta {
  label: string;
  shortLabel: string;
  color: string;
  initials: string;
}

export const ROLE_META: Record<RoleId, RoleMeta> = {
  director:            { label: 'Director',          shortLabel: 'DIR', color: '#d4a853', initials: 'DIR' },
  'digital-manager':   { label: 'Digital Manager',   shortLabel: 'DM',  color: '#9a6b3a', initials: 'DM'  },
  agent:               { label: 'Agent',             shortLabel: 'AGT', color: '#1d7ff3', initials: 'AG'  },
  'property-hunter':   { label: 'Property Hunter',   shortLabel: 'PH',  color: '#06b6d4', initials: 'PH'  },
  'community-manager': { label: 'Community Manager', shortLabel: 'CM',  color: '#ec4899', initials: 'CM'  },
};

// ─── Workflow types ──────────────────────────────────────────────

export interface WorkflowTrigger {
  label: string;
  icon: 'whatsapp' | 'email' | 'website' | 'facebook' | 'phone' | 'social' | 'referral' | 'crm';
  channel: 'digital' | 'direct' | 'referral' | 'internal';
}

export interface WorkflowCondition {
  condition: string;
  ifTrue: { responsible: RoleId; label: string };
  ifFalse: { responsible: RoleId; label: string };
}

export interface WorkflowTask {
  label: string;
  tools?: string[];       // e.g. ["WhatsApp", "CRM"]
  description?: string;
  involves?: (RoleId | 'lead' | 'partner') | (RoleId | 'lead' | 'partner')[];  // show avatar(s) when task involves other people
}

export interface WorkflowHandoff {
  from: RoleId;
  to: RoleId;
  task: string;
}

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  title: string;
  responsible: RoleId;
  tasks: WorkflowTask[];
  condition?: WorkflowCondition;
  recurrence?: { frequency: string; task: string; tools?: string[] };
  parallel?: boolean;
  handoff?: WorkflowHandoff;
  gateCondition?: string;
}

export interface Workflow {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  triggers: WorkflowTrigger[];
  triggerCondition?: WorkflowCondition;
  steps: WorkflowStep[];
}

// ─── Workflow data ───────────────────────────────────────────────

export const WORKFLOWS: Workflow[] = [
  {
    id: 'new-property',
    title: 'New Property',
    subtitle: 'Lead-to-listing pipeline',
    color: '#d4a853',
    triggers: [
      { label: 'Email',            icon: 'email',    channel: 'digital' },
      { label: 'Website Form',     icon: 'website',  channel: 'digital' },
      { label: 'WhatsApp Message', icon: 'whatsapp', channel: 'digital' },
      { label: 'Social Media',     icon: 'social',   channel: 'digital' },
      { label: 'Facebook Groups',  icon: 'facebook', channel: 'digital' },
      { label: 'Phone Call',       icon: 'phone',    channel: 'direct'  },
      { label: 'WhatsApp Call',    icon: 'whatsapp', channel: 'direct'  },
    ],
    triggerCondition: {
      condition: 'Direct Call',
      ifTrue:  { responsible: 'director',        label: 'Director' },
      ifFalse: { responsible: 'digital-manager', label: 'Digital Manager' },
    },
    steps: [
      // Step 1A: Director handles if Direct Call
      {
        id: 'step-1a',
        stepNumber: 1,
        title: 'Onboarding',
        responsible: 'director',
        tasks: [
          { label: 'Reply to Lead (Owner)',  tools: ['Script'], involves: 'lead' },
          { label: 'Collect Property Info',  tools: ['Form'], involves: 'lead' },
          { label: 'Pre-Qualify Property',   tools: ['Rules'] },
          { label: 'Connect Lead-Agent',     tools: ['WhatsApp'], involves: ['lead', 'agent'] },
          { label: 'Add Lead to CRM',        tools: ['CRM'] },
          { label: 'Brief Digital Manager',  tools: ['Phone'], involves: 'digital-manager' },
        ],
      },
      // Step 1B: Digital Manager handles if NOT Direct Call
      {
        id: 'step-1b',
        stepNumber: 1,
        title: 'Onboarding',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Reply to Lead (Owner)',  tools: ['Script'], involves: 'lead' },
          { label: 'Collect Property Info',  tools: ['Form'], involves: 'lead' },
          { label: 'Pre-Qualify Property',   tools: ['Rules'] },
          { label: 'Connect Lead-Agent',     tools: ['WhatsApp'], involves: ['lead', 'agent'] },
          { label: 'Add Lead to CRM',        tools: ['CRM'] },
        ],
      },
      // Step 2: Agent — Qualification
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Qualification',
        responsible: 'agent',
        parallel: true,
        tasks: [
          { label: 'Call Lead',                tools: ['Script'], involves: 'lead' },
          { label: 'Qualify Lead',             tools: ['Form'], involves: 'lead' },
          { label: 'Qualify Property',         tools: ['Form'], involves: 'lead' },
          { label: 'Discuss Conditions',       tools: ['Script'], involves: 'lead' },
          { label: 'Schedule Meeting',         tools: ['Google Calendar'], involves: 'lead' },
          { label: 'Update CRM',              tools: ['Google Sheet'] },
          { label: 'Brief Digital Manager',  tools: ['Phone'], involves: 'digital-manager' },
        ],
      },
      // Step 3: Agent — Meeting
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Meeting',
        responsible: 'agent',
        tasks: [
          { label: 'Property Inspection',      tools: ['Form'], involves: 'lead' },
          { label: 'Photo and Video Shoot',    tools: ['Camera'] },
          { label: 'Mandate Signing',          tools: ['Template'], involves: 'lead' },
          { label: 'Upload Photos',            tools: ['Google Drive'], involves: 'digital-manager' },
          { label: 'Send Report',              tools: ['WhatsApp'], involves: ['director', 'digital-manager'] },
        ],
      },
      // Step 4: Digital Manager — Publishing
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Publishing',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Prepare Descriptions',     tools: ['AI'] },
          { label: 'Prepare Photos',           tools: ['AI'] },
          { label: 'List on CRM',              tools: ['CRM'] },
          { label: 'Publish on Website',       tools: ['Webflow'] },
          { label: 'Publish on MLS',           tools: ['Mubawab', 'Avito'] },
          { label: 'Share on Social Media',    tools: ['Facebook', 'Instagram'] },
          { label: 'Share on Groups',          tools: ['WhatsApp', 'Facebook'] },
          { label: 'Share with Partners',      tools: ['WhatsApp'], involves: 'partner' },
        ],
      },
      // Follow-up: Digital Manager
      {
        id: 'followup-dm',
        stepNumber: 5,
        title: 'Follow-Up',
        responsible: 'digital-manager',
        tasks: [],
        recurrence: { frequency: 'Weekly', task: 'Republish Property on Main Channels', tools: ['Website CMS', 'Instagram', 'Facebook'] },
      },
      // Follow-up: Agent
      {
        id: 'followup-agent',
        stepNumber: 5,
        title: 'Follow-Up',
        responsible: 'agent',
        tasks: [],
        recurrence: { frequency: 'Bi-weekly', task: 'Send Follow-Up to check Property Availability', tools: ['WhatsApp', 'Phone'] },
      },
    ],
  },
  {
    id: 'new-tenant',
    title: 'New Tenant',
    subtitle: 'Tenant-to-lease pipeline',
    color: '#2dd4bf',
    triggers: [
      { label: 'Email',            icon: 'email',    channel: 'digital' },
      { label: 'Website Form',     icon: 'website',  channel: 'digital' },
      { label: 'WhatsApp Message', icon: 'whatsapp', channel: 'digital' },
      { label: 'Social Media',     icon: 'social',   channel: 'digital' },
      { label: 'Facebook Groups',  icon: 'facebook', channel: 'digital' },
      { label: 'Phone Call',       icon: 'phone',    channel: 'direct'  },
      { label: 'WhatsApp Call',    icon: 'whatsapp', channel: 'direct'  },
    ],
    triggerCondition: {
      condition: 'Direct Call',
      ifTrue:  { responsible: 'director',        label: 'Director' },
      ifFalse: { responsible: 'digital-manager', label: 'Digital Manager' },
    },
    steps: [
      // Step 1A: Director handles if Direct Call
      {
        id: 'step-1a',
        stepNumber: 1,
        title: 'Onboarding',
        responsible: 'director',
        tasks: [
          { label: 'Reply to Lead (Tenant)',  tools: ['Script'], involves: 'lead' },
          { label: 'Collect Tenant Criteria', tools: ['Form'], involves: 'lead' },
          { label: 'Pre-Qualify Tenant',      tools: ['Rules'] },
          { label: 'Connect Lead-Agent',      tools: ['WhatsApp'], involves: ['lead', 'agent'] },
          { label: 'Add Lead to CRM',         tools: ['CRM'] },
          { label: 'Brief Digital Manager',   tools: ['Phone'], involves: 'digital-manager' },
        ],
      },
      // Step 1B: Digital Manager handles if NOT Direct Call
      {
        id: 'step-1b',
        stepNumber: 1,
        title: 'Onboarding',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Reply to Lead (Tenant)',  tools: ['Script'], involves: 'lead' },
          { label: 'Collect Tenant Criteria', tools: ['Form'], involves: 'lead' },
          { label: 'Pre-Qualify Tenant',      tools: ['Rules'] },
          { label: 'Connect Lead-Agent',      tools: ['WhatsApp'], involves: ['lead', 'agent'] },
          { label: 'Add Lead to CRM',         tools: ['CRM'] },
        ],
      },
      // Step 2: Agent — Qualification
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Qualification',
        responsible: 'agent',
        parallel: true,
        tasks: [
          { label: 'Call Lead',               tools: ['Script'], involves: 'lead' },
          { label: 'Qualify Tenant Profile',  tools: ['Form'], involves: 'lead' },
          { label: 'Confirm Budget & Dates',  tools: ['Form'], involves: 'lead' },
          { label: 'Match Available Listings', tools: ['CRM'] },
          { label: 'Schedule Viewings',       tools: ['Google Calendar'], involves: 'lead' },
          { label: 'Update CRM',             tools: ['Google Sheet'] },
          { label: 'Brief Digital Manager',   tools: ['Phone'], involves: 'digital-manager' },
        ],
      },
      // Step 3: Agent — Viewings
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Viewings',
        responsible: 'agent',
        tasks: [
          { label: 'Conduct Property Tours',  tools: ['Checklist'], involves: 'lead' },
          { label: 'Collect Tenant Feedback',  tools: ['Form'], involves: 'lead' },
          { label: 'Negotiate Terms',          tools: ['Script'], involves: 'lead' },
          { label: 'Send Report',              tools: ['WhatsApp'], involves: ['director', 'digital-manager'] },
        ],
      },
      // Step 4: Digital Manager — Lease Processing
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Lease Processing',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Prepare Lease Agreement',  tools: ['Template'] },
          { label: 'Verify Tenant Documents',  tools: ['Checklist'], involves: 'lead' },
          { label: 'Coordinate with Owner',    tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Schedule Signing',         tools: ['Google Calendar'], involves: ['lead', 'partner'] },
          { label: 'Process Payment',          tools: ['Banking'], involves: 'lead' },
          { label: 'Update CRM',              tools: ['CRM'] },
        ],
      },
      // Follow-up: Digital Manager
      {
        id: 'followup-dm',
        stepNumber: 5,
        title: 'Follow-Up',
        responsible: 'digital-manager',
        tasks: [],
        recurrence: { frequency: 'Monthly', task: 'Check-in with Tenant for satisfaction & issues', tools: ['WhatsApp', 'Email'] },
      },
      // Follow-up: Agent
      {
        id: 'followup-agent',
        stepNumber: 5,
        title: 'Follow-Up',
        responsible: 'agent',
        tasks: [],
        recurrence: { frequency: 'Quarterly', task: 'Review lease renewal & tenant retention', tools: ['WhatsApp', 'Phone'] },
      },
    ],
  },
  {
    id: 'new-visit',
    title: 'New Visit Request',
    subtitle: 'Visit-request-to-feedback pipeline',
    color: '#1d7ff3',
    triggers: [
      { label: 'Website Form',     icon: 'website',  channel: 'digital' },
      { label: 'WhatsApp Message', icon: 'whatsapp', channel: 'digital' },
      { label: 'Email',            icon: 'email',    channel: 'digital' },
      { label: 'Phone Call',       icon: 'phone',    channel: 'direct'  },
      { label: 'WhatsApp Call',    icon: 'whatsapp', channel: 'direct'  },
    ],
    triggerCondition: {
      condition: 'Direct Call',
      ifTrue:  { responsible: 'director',        label: 'Director' },
      ifFalse: { responsible: 'digital-manager', label: 'Digital Manager' },
    },
    steps: [
      // Step 1A: Director handles if Direct Call
      {
        id: 'step-1a',
        stepNumber: 1,
        title: 'Request Intake',
        responsible: 'director',
        tasks: [
          { label: 'Reply to Visitor',          tools: ['Script'], involves: 'lead' },
          { label: 'Identify Property of Interest', tools: ['CRM'], involves: 'lead' },
          { label: 'Confirm Visit Availability', tools: ['Google Calendar'] },
          { label: 'Assign Agent',              tools: ['WhatsApp'], involves: ['lead', 'agent'] },
          { label: 'Add Lead to CRM',           tools: ['CRM'] },
          { label: 'Brief Digital Manager',     tools: ['Phone'], involves: 'digital-manager' },
        ],
      },
      // Step 1B: Digital Manager handles if NOT Direct Call
      {
        id: 'step-1b',
        stepNumber: 1,
        title: 'Request Intake',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Reply to Visitor',          tools: ['Script'], involves: 'lead' },
          { label: 'Identify Property of Interest', tools: ['CRM'], involves: 'lead' },
          { label: 'Confirm Visit Availability', tools: ['Google Calendar'] },
          { label: 'Assign Agent',              tools: ['WhatsApp'], involves: ['lead', 'agent'] },
          { label: 'Add Lead to CRM',           tools: ['CRM'] },
        ],
      },
      // Step 2: Agent — Preparation
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Preparation',
        responsible: 'agent',
        parallel: true,
        tasks: [
          { label: 'Call Visitor to Confirm',   tools: ['Script'], involves: 'lead' },
          { label: 'Verify Visitor Profile',    tools: ['Form'], involves: 'lead' },
          { label: 'Coordinate with Owner',     tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Confirm Date & Time',       tools: ['Google Calendar'], involves: ['lead', 'partner'] },
          { label: 'Prepare Property Details',  tools: ['CRM'] },
          { label: 'Update CRM',               tools: ['Google Sheet'] },
        ],
      },
      // Step 3: Agent — Visit
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Visit',
        responsible: 'agent',
        tasks: [
          { label: 'Conduct Property Visit',    tools: ['Checklist'], involves: 'lead' },
          { label: 'Answer Visitor Questions',   tools: ['Script'], involves: 'lead' },
          { label: 'Collect Visitor Feedback',   tools: ['Form'], involves: 'lead' },
          { label: 'Send Report',               tools: ['WhatsApp'], involves: ['director', 'digital-manager'] },
        ],
      },
      // Step 4: Digital Manager — Post-Visit
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Post-Visit',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Log Visit Outcome',         tools: ['CRM'] },
          { label: 'Send Summary to Owner',     tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Send Thank-You to Visitor', tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Flag Interested Leads',     tools: ['CRM'] },
          { label: 'Trigger Offer Workflow',    tools: ['CRM'], involves: 'agent' },
        ],
      },
      // Follow-up: Digital Manager
      {
        id: 'followup-dm',
        stepNumber: 5,
        title: 'Follow-Up',
        responsible: 'digital-manager',
        tasks: [],
        recurrence: { frequency: 'Weekly', task: 'Follow up with undecided visitors & suggest alternatives', tools: ['WhatsApp', 'Email'] },
      },
      // Follow-up: Agent
      {
        id: 'followup-agent',
        stepNumber: 5,
        title: 'Follow-Up',
        responsible: 'agent',
        tasks: [],
        recurrence: { frequency: 'Bi-weekly', task: 'Re-engage warm leads with new listings', tools: ['WhatsApp', 'Phone'] },
      },
    ],
  },
  {
    id: 'property-hunting',
    title: 'Property Hunting',
    subtitle: 'Tenant request-to-match pipeline',
    color: '#06b6d4',
    triggers: [
      { label: 'Open Tenant Request', icon: 'crm',      channel: 'internal' },
      { label: 'Agent Referral',      icon: 'whatsapp',  channel: 'direct' },
      { label: 'Owner Cold Outreach', icon: 'phone',     channel: 'direct' },
    ],
    triggerCondition: {
      condition: 'Internal Request',
      ifTrue:  { responsible: 'digital-manager', label: 'Digital Manager' },
      ifFalse: { responsible: 'property-hunter', label: 'Property Hunter' },
    },
    steps: [
      // Step 1A: Property Hunter handles direct sourcing
      {
        id: 'step-1a',
        stepNumber: 1,
        title: 'Brief & Assign',
        responsible: 'director',
        tasks: [
          { label: 'Review Tenant Criteria',     tools: ['CRM'] },
          { label: 'Define Search Perimeter',    tools: ['Map', 'CRM'] },
          { label: 'Assign Property Hunter',     tools: ['WhatsApp'], involves: 'property-hunter' },
          { label: 'Set Deadline & Budget',      tools: ['CRM'] },
          { label: 'Brief Digital Manager',      tools: ['Phone'], involves: 'digital-manager' },
          { label: 'Add to CRM',                tools: ['CRM'] },
        ],
      },
      // Step 1B: Digital Manager handles if from CRM trigger
      {
        id: 'step-1b',
        stepNumber: 1,
        title: 'Brief & Assign',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Review Tenant Criteria',     tools: ['CRM'] },
          { label: 'Define Search Perimeter',    tools: ['Map', 'CRM'] },
          { label: 'Assign Property Hunter',     tools: ['WhatsApp'], involves: 'property-hunter' },
          { label: 'Set Deadline & Budget',      tools: ['CRM'] },
          { label: 'Add to CRM',                tools: ['CRM'] },
        ],
      },
      // Step 2: Property Hunter — Sourcing
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Sourcing',
        responsible: 'property-hunter',
        parallel: true,
        tasks: [
          { label: 'Search MLS Platforms',       tools: ['Mubawab', 'Avito'] },
          { label: 'Browse Social Groups',       tools: ['Facebook', 'WhatsApp'] },
          { label: 'Contact Owner Network',      tools: ['WhatsApp', 'Phone'] },
          { label: 'Field Scouting',             tools: ['Map'] },
          { label: 'Shortlist Matches',          tools: ['CRM'] },
          { label: 'Update CRM',                tools: ['Google Sheet'] },
          { label: 'Report to Digital Manager',  tools: ['WhatsApp'], involves: 'digital-manager' },
        ],
      },
      // Step 3: Agent — Validation
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Validation',
        responsible: 'agent',
        tasks: [
          { label: 'Visit Shortlisted Properties', tools: ['Checklist'] },
          { label: 'Verify Conditions & Price',   tools: ['Form'], involves: 'partner' },
          { label: 'Present Options to Tenant',    tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Send Report',                 tools: ['WhatsApp'], involves: ['director', 'digital-manager'] },
        ],
      },
      // Step 4: Digital Manager — Matching
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Matching',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Confirm Tenant Selection',    tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Coordinate with Owner',       tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Schedule Visit for Tenant',   tools: ['Google Calendar'], involves: ['lead', 'agent'] },
          { label: 'Trigger Visit Workflow',      tools: ['CRM'] },
          { label: 'Update CRM Status',           tools: ['CRM'] },
        ],
      },
      // Follow-up: Property Hunter
      {
        id: 'followup-dm',
        stepNumber: 5,
        title: 'Follow-Up',
        responsible: 'property-hunter',
        tasks: [],
        recurrence: { frequency: 'Weekly', task: 'Continue sourcing if no match found & report progress', tools: ['WhatsApp', 'CRM'] },
      },
      // Follow-up: Agent
      {
        id: 'followup-agent',
        stepNumber: 5,
        title: 'Follow-Up',
        responsible: 'agent',
        tasks: [],
        recurrence: { frequency: 'Bi-weekly', task: 'Re-check tenant interest & adjust criteria if needed', tools: ['WhatsApp', 'Phone'] },
      },
    ],
  },
];
