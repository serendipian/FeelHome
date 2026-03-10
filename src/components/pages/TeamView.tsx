'use client';

import { useState, useRef, useEffect } from 'react';

// ── Data ────────────────────────────────────────────────────────────────

interface Responsibility {
  icon: React.ReactNode;
  label: string;
}

interface TeamMember {
  id: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  initials: string;
  scope?: string;
  location?: string;
  color: string;
  responsibilities: Responsibility[];
}

const director: TeamMember = {
  id: 'director',
  title: 'Director',
  subtitle: 'Agency Lead',
  tagline: 'Driving strategy, closing deals, building the team.',
  initials: 'DIR',
  color: '#d4a853',
  responsibilities: [
    { icon: <IconPeople />, label: 'HR Management' },
    { icon: <IconGear />, label: 'Operations' },
    { icon: <IconDiamond />, label: 'VIP Clients' },
    { icon: <IconHandshake />, label: 'Closing Supervision' },
    { icon: <IconChart />, label: 'Accounting & P&L' },
    { icon: <IconReport />, label: 'Reporting & KPIs' },
  ],
};

const backoffice: TeamMember[] = [
  {
    id: 'digital-manager',
    title: 'Digital Manager',
    subtitle: 'Community Manager',
    initials: 'DM',
    scope: 'Digital',
    color: '#8b5cf6',
    responsibilities: [
      { icon: <IconInbox />, label: 'Incoming requests' },
      { icon: <IconGlobe />, label: 'Listing publishing' },
      { icon: <IconMegaphone />, label: 'Social media mgmt' },
      { icon: <IconCalendar />, label: 'Content scheduling' },
      { icon: <IconChat />, label: 'Engagement & DMs' },
      { icon: <IconCamera />, label: 'Media coordination' },
    ],
  },
  {
    id: 'property-hunter',
    title: 'Property Hunter',
    subtitle: 'Customer Service',
    initials: 'PH',
    scope: 'Sourcing',
    color: '#06b6d4',
    responsibilities: [
      { icon: <IconSearch />, label: 'Property sourcing' },
      { icon: <IconPhone />, label: 'Owner outreach' },
      { icon: <IconInbox />, label: 'Inbound calls & msgs' },
      { icon: <IconFilter />, label: 'Lead qualification' },
      { icon: <IconDatabase />, label: 'Database updates' },
      { icon: <IconRefresh />, label: 'Follow-up tracking' },
    ],
  },
];

const frontoffice: TeamMember[] = [
  {
    id: 'agent-casa',
    title: 'Real Estate Agent',
    subtitle: 'Casablanca',
    initials: 'CA',
    scope: 'Field — Casablanca',
    location: 'Casablanca',
    color: '#2dd4bf',
    responsibilities: [
      { icon: <IconChat />, label: 'Lead communication' },
      { icon: <IconPeople />, label: 'Client meetings' },
      { icon: <IconBuilding />, label: 'Property visits' },
      { icon: <IconHandshake />, label: 'Negotiation' },
      { icon: <IconRefresh />, label: 'Follow-ups' },
      { icon: <IconReport />, label: 'Activity reporting' },
    ],
  },
  {
    id: 'agent-rabat',
    title: 'Real Estate Agent',
    subtitle: 'Rabat',
    initials: 'RA',
    scope: 'Field — Rabat',
    location: 'Rabat',
    color: '#1d7ff3',
    responsibilities: [
      { icon: <IconChat />, label: 'Lead communication' },
      { icon: <IconPeople />, label: 'Client meetings' },
      { icon: <IconBuilding />, label: 'Property visits' },
      { icon: <IconHandshake />, label: 'Negotiation' },
      { icon: <IconRefresh />, label: 'Follow-ups' },
      { icon: <IconReport />, label: 'Activity reporting' },
    ],
  },
];

// ── Main Component ──────────────────────────────────────────────────────

export default function TeamView() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto pb-8">
      {/* Inline keyframes */}
      <style>{`
        @keyframes connectorPulse {
          0%, 100% { opacity: 0.3; box-shadow: 0 0 6px 2px rgba(212,168,83,0.15); }
          50% { opacity: 1; box-shadow: 0 0 12px 4px rgba(212,168,83,0.4); }
        }
        @keyframes lineGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes branchGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes dotAppear {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes borderShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Header */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white/90 tracking-tight">Team Structure</h2>
        <p className="text-[12px] text-white/30 mt-1">Click on any role to expand responsibilities</p>
      </div>

      {/* ━━━ LEVEL 1 — Director ━━━ */}
      <DirectorCard member={director} expanded={expanded === director.id} onToggle={() => toggle(director.id)} />

      {/* ━━━ Connector: Director → Backoffice ━━━ */}
      <ConnectorFork />

      {/* ━━━ LEVEL 2 — Backoffice ━━━ */}
      <div className="mb-1">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)', color: 'rgba(139,92,246,0.6)' }}>
            <IconGear />
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-semibold">Backoffice</span>
          <div className="flex-1 max-w-[80px] h-px" style={{ background: 'linear-gradient(to right, rgba(139,92,246,0.15), transparent)' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MemberCard member={backoffice[0]} expanded={expanded === backoffice[0].id} onToggle={() => toggle(backoffice[0].id)} />
          <MemberCard member={backoffice[1]} expanded={expanded === backoffice[1].id} onToggle={() => toggle(backoffice[1].id)} />
        </div>
      </div>

      {/* ━━━ Connector: Backoffice → Agents (cross-connected mesh) ━━━ */}
      <ConnectorMesh />

      {/* ━━━ LEVEL 3 — Field Agents ━━━ */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)', color: 'rgba(45,212,191,0.6)' }}>
            <IconTarget />
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-semibold">Field Agents</span>
          <div className="flex-1 max-w-[80px] h-px" style={{ background: 'linear-gradient(to right, rgba(45,212,191,0.15), transparent)' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MemberCard member={frontoffice[0]} expanded={expanded === frontoffice[0].id} onToggle={() => toggle(frontoffice[0].id)} />
          <MemberCard member={frontoffice[1]} expanded={expanded === frontoffice[1].id} onToggle={() => toggle(frontoffice[1].id)} />
        </div>
      </div>

      {/* ━━━ Summary Bar ━━━ */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Headcount', value: '5', color: '#ffffff' },
          { label: 'Management', value: '1', color: '#d4a853' },
          { label: 'Backoffice', value: '2', color: '#8b5cf6' },
          { label: 'Frontoffice', value: '2', color: '#2dd4bf' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl px-5 py-4 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: kpi.color, opacity: kpi.color === '#ffffff' ? 0.4 : 0.7 }}
              />
              <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium">{kpi.label}</span>
            </div>
            <span className="text-2xl font-bold text-white/80 font-mono">{kpi.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Connector: Director → Backoffice (fork into 2) ─────────────────────

function ConnectorFork() {
  return (
    <div className="flex justify-center relative" style={{ height: 64 }}>
      {/* Vertical stem from Director */}
      <div
        className="absolute left-1/2 top-0 w-px origin-top"
        style={{
          height: 36,
          background: 'linear-gradient(to bottom, rgba(212,168,83,0.5), rgba(255,255,255,0.1))',
          animation: 'lineGrow 0.5s ease-out forwards',
          transform: 'translateX(-0.5px)',
        }}
      />
      {/* Glowing junction dot */}
      <div
        className="absolute left-1/2 rounded-full"
        style={{
          top: 32,
          width: 8,
          height: 8,
          background: '#d4a853',
          transform: 'translateX(-4px)',
          animation: 'connectorPulse 2.5s ease-in-out infinite, dotAppear 0.4s ease-out 0.4s both',
        }}
      />
      {/* Horizontal branch */}
      <div
        className="absolute"
        style={{
          top: 35,
          left: '25%',
          right: '25%',
          height: 1,
          background: 'linear-gradient(to right, rgba(255,255,255,0.04), rgba(255,255,255,0.12), rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
          animation: 'branchGrow 0.5s ease-out 0.5s both',
          transformOrigin: 'center',
        }}
      />
      {/* Left drop */}
      <div
        className="absolute origin-top"
        style={{ top: 36, left: '25%', width: 1, height: 28,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
          animation: 'lineGrow 0.3s ease-out 0.9s both',
        }}
      />
      {/* Right drop */}
      <div
        className="absolute origin-top"
        style={{ top: 36, right: '25%', width: 1, height: 28,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
          animation: 'lineGrow 0.3s ease-out 0.9s both',
        }}
      />
      {/* End dots */}
      <div className="absolute rounded-full" style={{ top: 32, left: '25%', width: 5, height: 5, background: 'rgba(139,92,246,0.4)', transform: 'translateX(-2.5px)', animation: 'dotAppear 0.3s ease-out 1s both' }} />
      <div className="absolute rounded-full" style={{ top: 32, right: '25%', width: 5, height: 5, background: 'rgba(6,182,212,0.4)', transform: 'translateX(2.5px)', animation: 'dotAppear 0.3s ease-out 1s both' }} />
    </div>
  );
}

// ── Connector: Backoffice → Agents (cross mesh — each BO connects to both agents) ──

function ConnectorMesh() {
  return (
    <div className="relative w-full" style={{ height: 64 }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 64"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left-to-Left (DM → Casa): straight down-left */}
        <line
          x1="200" y1="0" x2="200" y2="64"
          stroke="rgba(139,92,246,0.2)" strokeWidth="1"
          strokeDasharray="200" style={{ animation: 'drawLine 0.8s ease-out 0.2s both' }}
        />
        {/* Right-to-Right (PH → Rabat): straight down-right */}
        <line
          x1="600" y1="0" x2="600" y2="64"
          stroke="rgba(6,182,212,0.2)" strokeWidth="1"
          strokeDasharray="200" style={{ animation: 'drawLine 0.8s ease-out 0.2s both' }}
        />
        {/* Left-to-Right cross (DM → Rabat) */}
        <line
          x1="200" y1="0" x2="600" y2="64"
          stroke="rgba(139,92,246,0.1)" strokeWidth="1"
          strokeDasharray="200" style={{ animation: 'drawLine 1s ease-out 0.5s both' }}
        />
        {/* Right-to-Left cross (PH → Casa) */}
        <line
          x1="600" y1="0" x2="200" y2="64"
          stroke="rgba(6,182,212,0.1)" strokeWidth="1"
          strokeDasharray="200" style={{ animation: 'drawLine 1s ease-out 0.5s both' }}
        />
        {/* Center junction glow dot */}
        <circle cx="400" cy="32" r="3" fill="rgba(255,255,255,0.15)" style={{ animation: 'dotAppear 0.4s ease-out 0.8s both' }} />
      </svg>
      {/* "Communicates" label at center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-[9px] text-white/15 uppercase tracking-[0.2em] px-3 py-1 rounded-full"
          style={{ background: 'rgba(6,7,10,0.8)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          reports to
        </span>
      </div>
    </div>
  );
}

// ── Director Card ───────────────────────────────────────────────────────

function DirectorCard({
  member,
  expanded,
  onToggle,
}: {
  member: TeamMember;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="relative rounded-2xl cursor-pointer group transition-all duration-300 overflow-hidden"
      onClick={onToggle}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-2xl -z-10"
        style={{
          padding: 1,
          background: 'linear-gradient(135deg, rgba(212,168,83,0.4), rgba(212,168,83,0.08), rgba(212,168,83,0.25), rgba(212,168,83,0.08))',
          backgroundSize: '300% 300%',
          animation: 'borderShimmer 6s ease infinite',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />
      {/* Card background */}
      <div
        className="rounded-2xl transition-all duration-300"
        style={{
          background: expanded
            ? 'linear-gradient(135deg, rgba(212,168,83,0.06) 0%, rgba(212,168,83,0.02) 100%)'
            : 'linear-gradient(135deg, rgba(212,168,83,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        }}
      >
        <div className="px-7 py-6 flex items-center gap-6">
          {/* Initials avatar with glow ring */}
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{
                background: 'rgba(212,168,83,0.1)',
                border: '2px solid rgba(212,168,83,0.3)',
                boxShadow: expanded
                  ? '0 0 24px rgba(212,168,83,0.2), inset 0 0 12px rgba(212,168,83,0.05)'
                  : '0 0 12px rgba(212,168,83,0.1)',
              }}
            >
              <span className="text-lg font-bold tracking-wider" style={{ color: '#d4a853' }}>
                {member.initials}
              </span>
            </div>
          </div>

          {/* Title area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-[17px] font-bold text-white/90 tracking-tight">{member.title}</h3>
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-md"
                style={{
                  color: '#d4a853',
                  background: 'rgba(212,168,83,0.1)',
                  border: '1px solid rgba(212,168,83,0.15)',
                }}
              >
                {member.subtitle}
              </span>
            </div>
            {member.tagline && (
              <p className="text-[12px] text-white/35 mt-1.5 font-light tracking-wide">{member.tagline}</p>
            )}
          </div>

          {/* Expand chevron */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <svg
              className={`w-4 h-4 text-white/30 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Expanded responsibilities grid */}
        <ExpandableSection expanded={expanded}>
          <div className="px-7 pb-6">
            <div className="border-t border-white/[0.04] pt-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {member.responsibilities.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-white/[0.02]"
                    style={{ border: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(212,168,83,0.08)' }}>
                      <span style={{ color: 'rgba(212,168,83,0.7)' }}>{r.icon}</span>
                    </div>
                    <span className="text-[12px] text-white/60 font-medium leading-tight">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}


// ── Member Card ─────────────────────────────────────────────────────────

function MemberCard({
  member,
  expanded,
  onToggle,
}: {
  member: TeamMember;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-2xl cursor-pointer group transition-all duration-300 overflow-hidden"
      style={{
        background: expanded
          ? `linear-gradient(135deg, ${member.color}08 0%, ${member.color}03 100%)`
          : 'rgba(255,255,255,0.015)',
        border: `1px solid ${expanded ? `${member.color}20` : 'rgba(255,255,255,0.04)'}`,
        boxShadow: expanded ? `0 0 20px ${member.color}08` : 'none',
      }}
      onClick={onToggle}
      onMouseEnter={(e) => {
        if (!expanded) {
          e.currentTarget.style.transform = 'scale(1.01)';
          e.currentTarget.style.borderColor = `${member.color}30`;
          e.currentTarget.style.boxShadow = `0 0 16px ${member.color}10`;
        }
      }}
      onMouseLeave={(e) => {
        if (!expanded) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Avatar with colored ring */}
        <div className="relative shrink-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
            style={{
              background: `${member.color}10`,
              border: `2px solid ${member.color}35`,
              boxShadow: expanded ? `0 0 16px ${member.color}15` : 'none',
            }}
          >
            <span className="text-[13px] font-bold tracking-wider" style={{ color: `${member.color}cc` }}>
              {member.initials}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[13px] font-semibold text-white/85 tracking-tight">{member.title}</h4>
            {member.subtitle && (
              <>
                <span className="text-white/10">·</span>
                <span className="text-[11px] text-white/35 font-light">{member.subtitle}</span>
              </>
            )}
          </div>
          {member.scope && (
            <span
              className="inline-block mt-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md"
              style={{
                color: `${member.color}99`,
                background: `${member.color}0a`,
                border: `1px solid ${member.color}15`,
              }}
            >
              {member.scope}
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-white/20 transition-transform duration-300 shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Expanded responsibilities */}
      <ExpandableSection expanded={expanded}>
        <div className="px-5 pb-5">
          <div className="border-t border-white/[0.04] pt-4">
            <div className="grid grid-cols-2 gap-2">
              {member.responsibilities.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.02]"
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: `${member.color}0a`, color: `${member.color}80` }}
                  >
                    {r.icon}
                  </div>
                  <span className="text-[11px] text-white/50 font-medium leading-tight">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
}

// ── Expandable Section (smooth height animation) ────────────────────────

function ExpandableSection({ expanded, children }: { expanded: boolean; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(expanded ? contentRef.current.scrollHeight : 0);
    }
  }, [expanded]);

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-out"
      style={{ maxHeight: height, opacity: expanded ? 1 : 0 }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

// ── SVG Icons (inline, no dependencies) ─────────────────────────────────

function IconPeople() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconDiamond() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20" /><path d="M10 3l-4 6 6 13 6-13-4-6" />
    </svg>
  );
}

function IconHandshake() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 0 0 0-7.65z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconInbox() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconMegaphone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function IconDatabase() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="6" x2="9" y2="6.01" /><line x1="15" y1="6" x2="15" y2="6.01" /><line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" /><line x1="9" y1="14" x2="9" y2="14.01" /><line x1="15" y1="14" x2="15" y2="14.01" /><line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}
