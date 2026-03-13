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
  linkTo?: string;  // If set, this step is a link to another workflow (by id)
}

export interface ConnectorConfig {
  step1_step2?: { label: string; color: string };    // condition on merge lines → step2
  step2_step3?: { label: string; color: string };
  step2_step3bis?: { label: string; color: string }; // fork to step3bis at COL4 bottom
  step3_step4?: { label: string; color: string };
  step4_step5Top?: { label: string; color: string };
  step4_step5Bot?: { label: string; color: string };
  step3_step4bis?: { label: string; color: string }; // fork to step4bis at COL5 bottom
  step4_step5?: { label: string; color: string };     // step4→step5 (inline continuation)
  step5_step6?: { label: string; color: string };     // step5→step6 (inline continuation)
  step5_step6bis?: { label: string; color: string };  // step5→step6bis (fork bottom)
  step6_step7?: { label: string; color: string };     // step6→step7 (inline continuation)
  step6_step7bis?: { label: string; color: string };  // step6→step7bis (fork bottom)
  step7_step8?: { label: string; color: string };     // step7→step8 (inline continuation)
  step7bis_step8bis?: { label: string; color: string }; // step7bis→step8bis
  step8_step9?: { label: string; color: string };     // step8→step9 (inline continuation)
  step9_endTop?: { label: string; color: string };    // step9→followup-dm (end fork top)
  step9_endBot?: { label: string; color: string };    // step9→followup-agent (end fork bottom)
  step6_endTop?: { label: string; color: string };    // step6→followup-dm (end fork top)
  step6_endBot?: { label: string; color: string };    // step6→followup-agent (end fork bottom)
  step4bis_step5bis?: { label: string; color: string }; // step4bis→step5bis (e.g. Follow Up Owner→Property Hunting)
}

export interface Workflow {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  triggers: WorkflowTrigger[];
  triggerCondition?: WorkflowCondition;
  steps: WorkflowStep[];
  connectors?: ConnectorConfig;
}

// ─── Workflow data ───────────────────────────────────────────────

export const WORKFLOWS: Workflow[] = [
  {
    id: 'new-property',
    title: 'New Property',
    subtitle: 'Lead-to-listing pipeline',
    color: '#1e293b',
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
    connectors: {
      step2_step3: { label: 'QUALIFIED', color: '#22c55e' },
      step3_step4: { label: 'SIGNED MANDATE', color: '#22c55e' },
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
    color: '#1e293b',
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
    connectors: {
      step2_step3: { label: 'QUALIFIED', color: '#22c55e' },
      step3_step4: { label: 'IF AVAILABLE + MATCHING', color: '#22c55e' },
      step3_step4bis: { label: 'NO MATCH', color: '#ef4444' },
      step4_step5: { label: 'INTERESTED LEAD', color: '#22c55e' },
      step4bis_step5bis: { label: '', color: '' },
      step5_step6: { label: 'AVAILABLE PROPERTY + VALIDATED PROFILE', color: '#22c55e' },
      step5_step6bis: { label: 'NOT AVAILABLE OR REFUSED PROFILE', color: '#ef4444' },
      step6_step7: { label: 'VIEWING REQUEST', color: '#22c55e' },
      step6_step7bis: { label: 'NOT INTERESTED', color: '#ef4444' },
      step7_step8: { label: 'CONFIRMED', color: '#22c55e' },
      step7bis_step8bis: { label: '', color: '' },
      step8_step9: { label: 'VISIT DONE', color: '#22c55e' },
      step9_endTop: { label: 'INTERESTED + OFFER', color: '#22c55e' },
      step9_endBot: { label: 'NOT INTERESTED', color: '#ef4444' },
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
          { label: 'Discuss Conditions',      tools: ['Script'], involves: 'lead' },
          { label: 'Update CRM',             tools: ['Google Sheet'] },
          { label: 'Brief Digital Manager',   tools: ['Phone'], involves: 'digital-manager' },
        ],
      },
      // Step 3: Agent — Property Matching
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Property Matching',
        responsible: 'agent',
        tasks: [
          { label: 'Fetch Available Listings', tools: ['CRM'] },
          { label: 'List Matching Properties', tools: ['CRM'] },
        ],
      },
      // Step 4: Agent — Share Matching Properties
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Share Matching Properties',
        responsible: 'agent',
        tasks: [
          { label: 'Send Photos',            tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Share Description',       tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Collect Feedback',        tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Update CRM',             tools: ['CRM'] },
        ],
      },
      // Step 4bis: Agent — No Match fallback
      {
        id: 'step-4bis',
        stepNumber: 4,
        title: 'No Match Follow-Up',
        responsible: 'agent',
        tasks: [
          { label: 'Inform Lead',            tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Hook Lead',              tools: ['Script'], involves: 'lead' },
          { label: 'Schedule Follow Up',     tools: ['Google Calendar'], involves: 'lead' },
        ],
      },
      // Step 5: Agent — Verify with Owner (from New Visit Request)
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Verify with Owner',
        responsible: 'agent',
        parallel: true,
        tasks: [
          { label: 'Assess Property Availability',   tools: ['CRM'], involves: 'partner' },
          { label: 'Share Lead Profile & Interest',   tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Assess Viewing Availabilities',   tools: ['Google Calendar'], involves: ['lead', 'partner'] },
        ],
      },
      // Step 5bis: Property Hunting — Link to workflow (NO MATCH path from step4bis)
      {
        id: 'step-5bis',
        stepNumber: 5,
        title: 'Property Hunting',
        responsible: 'property-hunter',
        tasks: [],
        linkTo: 'property-hunting',
      },
      // Step 6: Agent — Confirm with Tenant
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Confirm with Tenant',
        responsible: 'agent',
        tasks: [
          { label: 'Confirm Property Availability',  tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Answer Additional Questions',     tools: ['WhatsApp'], involves: 'lead' },
        ],
      },
      // Step 6bis: Follow Up - Tenant (NOT AVAILABLE OR REFUSED)
      {
        id: 'step-6bis',
        stepNumber: 6,
        title: 'Follow Up - Tenant',
        responsible: 'agent',
        tasks: [
          { label: 'Inform Lead',   tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Hook Lead',     tools: ['Script'], involves: 'lead' },
        ],
      },
      // Step 7: Agent — Scheduling
      {
        id: 'step-7',
        stepNumber: 7,
        title: 'Scheduling',
        responsible: 'agent',
        parallel: true,
        tasks: [
          { label: 'Re-Assess Owner Availability',    tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Re-Assess Visitor Availability',   tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Coordinate with Own Calendar',     tools: ['Google Calendar'] },
          { label: 'Propose Visit Date & Time',        tools: ['WhatsApp'], involves: ['lead', 'partner'] },
          { label: 'Confirm with Owner',               tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Confirm with Visitor',             tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Set Calendar Event',               tools: ['Google Calendar'], involves: ['lead', 'partner'] },
          { label: 'Prepare Property Details',         tools: ['CRM'] },
          { label: 'Update CRM',                      tools: ['Google Sheet'] },
        ],
      },
      // Step 7bis: Follow Up - Owner (NOT INTERESTED)
      {
        id: 'step-7bis',
        stepNumber: 7,
        title: 'Follow Up - Owner',
        responsible: 'agent',
        tasks: [
          { label: 'Inform Owner',   tools: ['WhatsApp'], involves: 'partner' },
        ],
      },
      // Step 8: Agent — Tenant Viewing
      {
        id: 'step-8',
        stepNumber: 8,
        title: 'Tenant Viewing',
        responsible: 'agent',
        tasks: [
          { label: 'Re-Confirm Owner Availability',    tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Re-Confirm Visitor Availability',   tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Arrive 15min in Advance' },
          { label: 'Prepare Property',                  tools: ['Checklist'] },
          { label: 'Present Agency',                    tools: ['Brochure', 'Business Card'] },
          { label: 'Conduct Property Tour',             involves: 'lead' },
          { label: 'Answer Tenant Questions',            involves: 'lead' },
          { label: 'Collect Tenant Feedback',            tools: ['Form'], involves: 'lead' },
          { label: 'Send Report',                       tools: ['WhatsApp'], involves: ['director', 'digital-manager'] },
        ],
      },
      // Step 8bis: Property Hunting — Link to workflow
      {
        id: 'step-8bis',
        stepNumber: 8,
        title: 'Property Hunting',
        responsible: 'property-hunter',
        tasks: [],
        linkTo: 'property-hunting',
      },
      // Step 9: Agent — Post Viewing
      {
        id: 'step-9',
        stepNumber: 9,
        title: 'Post Viewing',
        responsible: 'agent',
        tasks: [
          { label: 'Update CRM',                tools: ['CRM'] },
          { label: 'Send Summary to Owner',      tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Send Thank You to Tenant',   tools: ['WhatsApp'], involves: 'lead' },
        ],
      },
      // End top: Offer Management — Link to Lease Processing
      {
        id: 'followup-dm',
        stepNumber: 10,
        title: 'Offer Management',
        responsible: 'agent',
        tasks: [],
        linkTo: 'lease-processing',
      },
      // End bottom: Property Hunting — Link to workflow
      {
        id: 'followup-agent',
        stepNumber: 10,
        title: 'Property Hunting',
        responsible: 'property-hunter',
        tasks: [],
        linkTo: 'property-hunting',
      },
    ],
  },
  {
    id: 'new-visit',
    title: 'New Visit Request',
    subtitle: 'Visit-request-to-viewing pipeline',
    color: '#1e293b',
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
    connectors: {
      step1_step2: { label: 'VIEWING REQUEST', color: '#22c55e' },
      step2_step3: { label: 'AVAILABLE PROPERTY + VALIDATED PROFILE', color: '#22c55e' },
      step2_step3bis: { label: 'NOT AVAILABLE OR REFUSED PROFILE', color: '#ef4444' },
      step3_step4: { label: 'VIEWING REQUEST', color: '#22c55e' },
      step3_step4bis: { label: 'NOT INTERESTED', color: '#ef4444' },
      step4_step5: { label: 'CONFIRMED', color: '#22c55e' },
      step5_step6: { label: 'VISIT DONE', color: '#22c55e' },
      step4bis_step5bis: { label: '', color: '' },
      step6_endTop: { label: 'INTERESTED + OFFER', color: '#22c55e' },
      step6_endBot: { label: 'NOT INTERESTED', color: '#ef4444' },
    },
    steps: [
      // Step 1A: Director handles if Direct Call
      {
        id: 'step-1a',
        stepNumber: 1,
        title: 'Request Intake',
        responsible: 'director',
        tasks: [
          { label: 'Reply to Lead (Tenant)',        tools: ['Script'], involves: 'lead' },
          { label: 'Identify Property of Interest', tools: ['CRM'], involves: 'lead' },
          { label: 'Assess Lead Profile',           tools: ['Form'], involves: 'lead' },
          { label: 'Disclose Red Flags',            tools: ['Rules'] },
          { label: 'Re-Confirm Lead Interest',      tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Assign Agent',                  tools: ['WhatsApp'], involves: ['lead', 'agent'] },
          { label: 'Add Lead to CRM',               tools: ['CRM'] },
          { label: 'Brief Digital Manager',         tools: ['Phone'], involves: 'digital-manager' },
        ],
      },
      // Step 1B: Digital Manager handles if NOT Direct Call
      {
        id: 'step-1b',
        stepNumber: 1,
        title: 'Request Intake',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Reply to Lead (Tenant)',        tools: ['Script'], involves: 'lead' },
          { label: 'Identify Property of Interest', tools: ['CRM'], involves: 'lead' },
          { label: 'Assess Lead Profile',           tools: ['Form'], involves: 'lead' },
          { label: 'Disclose Red Flags',            tools: ['Rules'] },
          { label: 'Re-Confirm Lead Interest',      tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Assign Agent',                  tools: ['WhatsApp'], involves: ['lead', 'agent'] },
          { label: 'Add Lead to CRM',               tools: ['CRM'] },
        ],
      },
      // Step 2: Agent — Verify with Owner
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Verify with Owner',
        responsible: 'agent',
        parallel: true,
        tasks: [
          { label: 'Assess Property Availability',   tools: ['CRM'], involves: 'partner' },
          { label: 'Share Lead Profile & Interest',   tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Assess Viewing Availabilities',   tools: ['Google Calendar'], involves: ['lead', 'partner'] },
        ],
      },
      // Step 3: Agent — Confirm with Tenant
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Confirm with Tenant',
        responsible: 'agent',
        tasks: [
          { label: 'Confirm Property Availability',  tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Answer Additional Questions',     tools: ['WhatsApp'], involves: 'lead' },
        ],
      },
      // Step 3bis: Follow Up - Tenant (NOT AVAILABLE OR REFUSED)
      {
        id: 'step-3bis',
        stepNumber: 3,
        title: 'Follow Up - Tenant',
        responsible: 'agent',
        tasks: [
          { label: 'Inform Lead',   tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Hook Lead',     tools: ['Script'], involves: 'lead' },
        ],
      },
      // Step 4: Agent — Scheduling
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Scheduling',
        responsible: 'agent',
        parallel: true,
        tasks: [
          { label: 'Re-Assess Owner Availability',    tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Re-Assess Visitor Availability',   tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Coordinate with Own Calendar',     tools: ['Google Calendar'] },
          { label: 'Propose Visit Date & Time',        tools: ['WhatsApp'], involves: ['lead', 'partner'] },
          { label: 'Confirm with Owner',               tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Confirm with Visitor',             tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Set Calendar Event',               tools: ['Google Calendar'], involves: ['lead', 'partner'] },
          { label: 'Prepare Property Details',         tools: ['CRM'] },
          { label: 'Update CRM',                      tools: ['Google Sheet'] },
        ],
      },
      // Step 4bis: Follow Up - Owner (NOT INTERESTED)
      {
        id: 'step-4bis',
        stepNumber: 4,
        title: 'Follow Up - Owner',
        responsible: 'agent',
        tasks: [
          { label: 'Inform Owner',   tools: ['WhatsApp'], involves: 'partner' },
        ],
      },
      // Step 5: Agent — Tenant Viewing
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Tenant Viewing',
        responsible: 'agent',
        tasks: [
          { label: 'Re-Confirm Owner Availability',    tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Re-Confirm Visitor Availability',   tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Arrive 15min in Advance' },
          { label: 'Prepare Property',                  tools: ['Checklist'] },
          { label: 'Present Agency',                    tools: ['Brochure', 'Business Card'] },
          { label: 'Conduct Property Tour',             involves: 'lead' },
          { label: 'Answer Tenant Questions',            involves: 'lead' },
          { label: 'Collect Tenant Feedback',            tools: ['Form'], involves: 'lead' },
          { label: 'Send Report',                       tools: ['WhatsApp'], involves: ['director', 'digital-manager'] },
        ],
      },
      // Step 5bis: Property Hunting — Link to workflow (NOT INTERESTED path)
      {
        id: 'step-5bis',
        stepNumber: 5,
        title: 'Property Hunting',
        responsible: 'property-hunter',
        tasks: [],
        linkTo: 'property-hunting',
      },
      // Step 6: Agent — Post Viewing
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Post Viewing',
        responsible: 'agent',
        tasks: [
          { label: 'Update CRM',                tools: ['CRM'] },
          { label: 'Send Summary to Owner',      tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Send Thank You to Tenant',   tools: ['WhatsApp'], involves: 'lead' },
        ],
      },
      // End top: Offer Management — Link to Lease Processing
      {
        id: 'followup-dm',
        stepNumber: 7,
        title: 'Offer Management',
        responsible: 'agent',
        tasks: [],
        linkTo: 'lease-processing',
      },
      // End bottom: Property Hunting — Link to workflow (NOT INTERESTED after viewing)
      {
        id: 'followup-agent',
        stepNumber: 7,
        title: 'Property Hunting',
        responsible: 'property-hunter',
        tasks: [],
        linkTo: 'property-hunting',
      },
    ],
  },
  {
    id: 'property-hunting',
    title: 'Property Hunting',
    subtitle: 'Tenant request-to-match pipeline',
    color: '#1e293b',
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
    connectors: {
      step2_step3: { label: 'SHORTLISTED', color: '#22c55e' },
      step3_step4: { label: 'VALIDATED', color: '#22c55e' },
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
  {
    id: 'schedule-viewing',
    title: 'Schedule Viewing',
    subtitle: 'Viewing coordination pipeline',
    color: '#1e293b',
    triggers: [
      { label: 'Tenant Interest',   icon: 'crm',      channel: 'internal' },
      { label: 'WhatsApp Message',   icon: 'whatsapp', channel: 'digital' },
      { label: 'Phone Call',         icon: 'phone',    channel: 'direct'  },
    ],
    triggerCondition: {
      condition: 'Internal Request',
      ifTrue:  { responsible: 'digital-manager', label: 'Digital Manager' },
      ifFalse: { responsible: 'agent',           label: 'Agent' },
    },
    connectors: {
      step2_step3: { label: 'CONFIRMED', color: '#22c55e' },
      step3_step4: { label: 'VISIT DONE', color: '#22c55e' },
      step4_step5Top: { label: 'INTERESTED + OFFER', color: '#22c55e' },
      step4_step5Bot: { label: 'NOT INTERESTED', color: '#ef4444' },
    },
    steps: [
      {
        id: 'step-1a',
        stepNumber: 1,
        title: 'Coordination',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Confirm Tenant Interest',     tools: ['CRM'], involves: 'lead' },
          { label: 'Check Property Availability',  tools: ['CRM'] },
          { label: 'Coordinate with Owner',        tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Assign Agent',                 tools: ['WhatsApp'], involves: 'agent' },
          { label: 'Add to CRM',                  tools: ['CRM'] },
        ],
      },
      {
        id: 'step-1b',
        stepNumber: 1,
        title: 'Coordination',
        responsible: 'agent',
        tasks: [
          { label: 'Confirm Tenant Interest',     tools: ['CRM'], involves: 'lead' },
          { label: 'Check Property Availability',  tools: ['CRM'] },
          { label: 'Coordinate with Owner',        tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Add to CRM',                  tools: ['CRM'] },
        ],
      },
      // Step 2: Agent — Scheduling
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Scheduling',
        responsible: 'agent',
        parallel: true,
        tasks: [
          { label: 'Re-Assess Owner Availability',    tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Re-Assess Visitor Availability',   tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Coordinate with Own Calendar',     tools: ['Google Calendar'] },
          { label: 'Propose Visit Date & Time',        tools: ['WhatsApp'], involves: ['lead', 'partner'] },
          { label: 'Confirm with Owner',               tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Confirm with Visitor',             tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Set Calendar Event',               tools: ['Google Calendar'], involves: ['lead', 'partner'] },
          { label: 'Prepare Property Details',         tools: ['CRM'] },
          { label: 'Update CRM',                      tools: ['Google Sheet'] },
        ],
      },
      // Step 3: Agent — Tenant Viewing
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Tenant Viewing',
        responsible: 'agent',
        tasks: [
          { label: 'Re-Confirm Owner Availability',    tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Re-Confirm Visitor Availability',   tools: ['WhatsApp'], involves: 'lead' },
          { label: 'Arrive 15min in Advance' },
          { label: 'Prepare Property',                  tools: ['Checklist'] },
          { label: 'Present Agency',                    tools: ['Brochure', 'Business Card'] },
          { label: 'Conduct Property Tour',             involves: 'lead' },
          { label: 'Answer Tenant Questions',            involves: 'lead' },
          { label: 'Collect Tenant Feedback',            tools: ['Form'], involves: 'lead' },
          { label: 'Send Report',                       tools: ['WhatsApp'], involves: ['director', 'digital-manager'] },
        ],
      },
      // Step 4: Agent — Post Viewing
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Post Viewing',
        responsible: 'agent',
        tasks: [
          { label: 'Update CRM',                tools: ['CRM'] },
          { label: 'Send Summary to Owner',      tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Send Thank You to Tenant',   tools: ['WhatsApp'], involves: 'lead' },
        ],
      },
      // Step 5 top: Offer Management — Link to Lease Processing
      {
        id: 'followup-dm',
        stepNumber: 5,
        title: 'Offer Management',
        responsible: 'agent',
        tasks: [],
        linkTo: 'lease-processing',
      },
      // Step 5 bottom: Follow-Up Agent
      {
        id: 'followup-agent',
        stepNumber: 5,
        title: 'Follow-Up',
        responsible: 'agent',
        tasks: [],
        recurrence: { frequency: 'Bi-weekly', task: 'Re-engage undecided tenants with new options', tools: ['WhatsApp', 'Phone'] },
      },
    ],
  },
  {
    id: 'lease-processing',
    title: 'Lease Processing',
    subtitle: 'Lease negotiation-to-signing pipeline',
    color: '#1e293b',
    triggers: [
      { label: 'Viewing Outcome',   icon: 'crm',      channel: 'internal' },
      { label: 'Direct Agreement',   icon: 'whatsapp', channel: 'digital' },
      { label: 'Phone Call',         icon: 'phone',    channel: 'direct'  },
    ],
    triggerCondition: {
      condition: 'Internal Request',
      ifTrue:  { responsible: 'digital-manager', label: 'Digital Manager' },
      ifFalse: { responsible: 'director',        label: 'Director' },
    },
    connectors: {
      step2_step3: { label: 'TERMS AGREED', color: '#22c55e' },
      step3_step4: { label: 'SIGNED', color: '#22c55e' },
    },
    steps: [
      {
        id: 'step-1a',
        stepNumber: 1,
        title: 'Intake',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Confirm Tenant Selection',   tools: ['CRM'], involves: 'lead' },
          { label: 'Verify Property Status',     tools: ['CRM'] },
          { label: 'Notify Owner',              tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Assign Agent',               tools: ['WhatsApp'], involves: 'agent' },
          { label: 'Add to CRM',                tools: ['CRM'] },
        ],
      },
      {
        id: 'step-1b',
        stepNumber: 1,
        title: 'Intake',
        responsible: 'director',
        tasks: [
          { label: 'Confirm Tenant Selection',   tools: ['CRM'], involves: 'lead' },
          { label: 'Verify Property Status',     tools: ['CRM'] },
          { label: 'Notify Owner',              tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Assign Agent',               tools: ['WhatsApp'], involves: 'agent' },
          { label: 'Brief Digital Manager',      tools: ['Phone'], involves: 'digital-manager' },
          { label: 'Add to CRM',                tools: ['CRM'] },
        ],
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Negotiation',
        responsible: 'agent',
        parallel: true,
        tasks: [
          { label: 'Discuss Lease Terms',        tools: ['Script'], involves: ['lead', 'partner'] },
          { label: 'Negotiate Price & Duration', tools: ['Script'], involves: ['lead', 'partner'] },
          { label: 'Confirm Final Conditions',   tools: ['WhatsApp'], involves: ['lead', 'partner'] },
          { label: 'Update CRM',               tools: ['Google Sheet'] },
          { label: 'Brief Digital Manager',      tools: ['Phone'], involves: 'digital-manager' },
        ],
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Documentation',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Prepare Lease Agreement',    tools: ['Template'] },
          { label: 'Verify Tenant Documents',    tools: ['Checklist'], involves: 'lead' },
          { label: 'Coordinate with Owner',      tools: ['WhatsApp'], involves: 'partner' },
          { label: 'Schedule Signing',           tools: ['Google Calendar'], involves: ['lead', 'partner'] },
        ],
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Closing',
        responsible: 'digital-manager',
        tasks: [
          { label: 'Lease Signing',              tools: ['Template'], involves: ['lead', 'partner'] },
          { label: 'Process Payment',            tools: ['Banking'], involves: 'lead' },
          { label: 'Key Handover',               tools: ['Checklist'], involves: ['lead', 'partner'] },
          { label: 'Send Welcome Pack',          tools: ['Email'], involves: 'lead' },
          { label: 'Update CRM Status',          tools: ['CRM'] },
        ],
      },
      {
        id: 'followup-dm',
        stepNumber: 5,
        title: 'Follow-Up',
        responsible: 'digital-manager',
        tasks: [],
        recurrence: { frequency: 'Monthly', task: 'Check-in with tenant for satisfaction & issues', tools: ['WhatsApp', 'Email'] },
      },
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
];
