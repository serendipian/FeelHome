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
  'digital-manager':   { label: 'Digital Manager',   shortLabel: 'DM',  color: '#8b5cf6', initials: 'DM'  },
  agent:               { label: 'Agent',             shortLabel: 'AGT', color: '#1d7ff3', initials: 'AG'  },
  'property-hunter':   { label: 'Property Hunter',   shortLabel: 'PH',  color: '#06b6d4', initials: 'PH'  },
  'community-manager': { label: 'Community Manager', shortLabel: 'CM',  color: '#ec4899', initials: 'CM'  },
};

// ─── Workflow types ──────────────────────────────────────────────

export interface WorkflowTrigger {
  label: string;
  icon: 'whatsapp' | 'email' | 'website' | 'facebook' | 'phone' | 'social' | 'referral';
  channel: 'digital' | 'direct' | 'referral';
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
          { label: 'Reply to Lead (Owner)',  tools: ['WhatsApp', 'Phone'] },
          { label: 'Collect Property Info',  tools: ['WhatsApp', 'Phone'] },
          { label: 'Pre-Qualify Request',    tools: ['CRM'] },
          { label: 'Refer Lead to Agent',    tools: ['CRM', 'WhatsApp'] },
          { label: 'Add Lead to CRM',        tools: ['CRM'] },
        ],
        handoff: {
          from: 'director',
          to: 'digital-manager',
          task: 'Brief Digital Manager about the call',
        },
      },
      // Step 1B: Digital Manager handles if NOT Direct Call
      {
        id: 'step-1b',
        stepNumber: 1,
        title: 'Onboarding',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Reply to Lead (Owner)',      tools: ['WhatsApp', 'Email'] },
          { label: 'Collect Property Info',      tools: ['WhatsApp', 'Email'] },
          { label: 'Pre-Qualify Request',        tools: ['CRM'] },
          { label: 'Refer Lead to Agent/Director', tools: ['CRM', 'WhatsApp'] },
          { label: 'Add Lead to CRM',            tools: ['CRM'] },
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
          { label: 'Call Lead',                tools: ['Phone'] },
          { label: 'Qualify Lead + Property',  tools: ['CRM', 'Phone'] },
          { label: 'Set Conditions',           tools: ['CRM'] },
          { label: 'Schedule Meeting',         tools: ['WhatsApp', 'Google Calendar'] },
        ],
      },
      // Step 3: Agent — Meeting
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Meeting',
        responsible: 'agent',
        tasks: [
          { label: 'Property Inspection',  tools: ['Phone', 'CRM'] },
          { label: 'Photo Shoot',          tools: ['Camera'] },
          { label: 'Mandate Signing',      tools: ['CRM'] },
        ],
      },
      // Step 4: Digital Manager — Publishing
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Publishing',
        responsible: 'digital-manager',
        gateCondition: 'Photos Available + Mandate Signed',
        tasks: [
          { label: 'List Property on CRM',                tools: ['CRM'] },
          { label: 'Publish Property on Website',          tools: ['Website CMS'] },
          { label: 'Publish Property on MLS',              tools: ['MLS Platform'] },
          { label: 'Publish Property on Social Media',     tools: ['Instagram', 'Facebook'] },
          { label: 'Publish Property on Specialized Groups', tools: ['Facebook', 'WhatsApp'] },
          { label: 'Share Property with Partners',         tools: ['WhatsApp', 'Email'] },
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
];
