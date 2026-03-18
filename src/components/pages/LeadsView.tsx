'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { LeadSource, LeadChannel, PipelineTeamMember, DealSigner, PipelineConnections } from '@/types/leads';
import { useLeads } from '@/context/LeadsContext';

/* ------------------------------------------------------------------ */
/*  LeadsEditableCell                                                  */
/* ------------------------------------------------------------------ */

function LeadsEditableCell({ value, onSave, isDark, size = 'sm' }: {
  value: number;
  onSave: (v: number) => void;
  isDark: boolean;
  size?: 'sm' | 'lg';
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(String(value)); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n !== value) onSave(n);
    else setDraft(String(value));
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="bg-transparent text-center outline-none"
        style={{
          width: size === 'lg' ? '60px' : '40px',
          fontSize: size === 'lg' ? '20px' : '13px',
          fontWeight: 600,
          color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
        }}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(String(value)); setEditing(false); }
        }}
      />
    );
  }

  return (
    <span
      className="cursor-pointer rounded px-1 transition-colors"
      style={{
        fontSize: size === 'lg' ? '20px' : '13px',
        fontWeight: 600,
        color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
      }}
      onMouseEnter={(e) => { (e.target as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
      onClick={() => setEditing(true)}
    >
      {value}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SourceCard                                                         */
/* ------------------------------------------------------------------ */

function SourceCard({ source, onUpdate, isDark }: {
  source: LeadSource;
  onUpdate: (value: number) => void;
  isDark: boolean;
}) {
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const bgColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const visualBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  const labelColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
  const sublabelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const renderVisual = () => {
    if (source.imageType === 'laptop') {
      return (
        <div className="h-[50px] flex items-center justify-center" style={{ background: visualBg }}>
          <div
            className="relative rounded-sm overflow-hidden"
            style={{
              width: '60px',
              height: '38px',
              border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
              borderRadius: '3px 3px 0 0',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            }}
          >
            {source.imageUrl ? (
              <img src={source.imageUrl} alt={source.label} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[8px] font-medium" style={{ color: sublabelColor }}>
                {source.label}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (source.imageType === 'logo') {
      return (
        <div className="h-[50px] flex items-center justify-center" style={{ background: visualBg }}>
          {source.imageUrl ? (
            <img src={source.imageUrl} alt={source.label} className="w-7 h-7 rounded object-cover" />
          ) : (
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-semibold"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              }}
            >
              {source.label.charAt(0)}
            </div>
          )}
        </div>
      );
    }

    // icon variant
    return (
      <div className="h-[50px] flex items-center justify-center" style={{ background: visualBg }}>
        <div
          className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-semibold"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          }}
        >
          {source.sublabel?.charAt(0) || source.label.charAt(0)}
        </div>
      </div>
    );
  };

  return (
    <div
      className="rounded-lg overflow-hidden transition-colors"
      style={{
        width: '100px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
      }}
      data-node={source.id}
    >
      {renderVisual()}
      <div className="px-1.5 py-1.5 text-center">
        <div className="text-[9px] font-medium truncate" style={{ color: labelColor }}>{source.label}</div>
        {source.sublabel && (
          <div className="text-[8px]" style={{ color: sublabelColor }}>{source.sublabel}</div>
        )}
        <div className="mt-0.5">
          <LeadsEditableCell value={source.leadsPerMonth} onSave={onUpdate} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SourceCategoryGroup                                                */
/* ------------------------------------------------------------------ */

function SourceCategoryGroup({ label, sources, gridClass, dataNode, onUpdate, isDark }: {
  label: string;
  sources: LeadSource[];
  gridClass?: string;
  dataNode: string;
  onUpdate: (id: string, value: number) => void;
  isDark: boolean;
}) {
  const headerColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const treeLineColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="flex flex-col items-center" data-node={dataNode}>
      {/* Category header */}
      <div
        className="text-[10px] font-semibold uppercase tracking-wider mb-1"
        style={{ color: headerColor }}
      >
        {label}
      </div>
      {/* Tree line */}
      <div className="w-px h-2.5 mb-1" style={{ background: treeLineColor }} />
      {/* Cards grid */}
      <div className={gridClass || 'flex'} style={{ gap: '8px' }}>
        {sources.map(s => (
          <SourceCard
            key={s.id}
            source={s}
            onUpdate={(v) => onUpdate(s.id, v)}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ChannelCard                                                        */
/* ------------------------------------------------------------------ */

function ChannelCard({ channel, onUpdate, isDark }: {
  channel: LeadChannel;
  onUpdate: (value: number) => void;
  isDark: boolean;
}) {
  return (
    <div
      className="rounded-lg p-2.5 text-center w-[95px] transition-colors"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      }}
      data-node={`ch-${channel.id}`}
    >
      <div className="text-base mb-0.5 opacity-80">{channel.icon}</div>
      <div className="font-medium text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
        {channel.label}
      </div>
      <div className="mt-1">
        <LeadsEditableCell value={channel.leadsPerMonth} onSave={onUpdate} isDark={isDark} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TeamCard                                                           */
/* ------------------------------------------------------------------ */

function TeamCard({ member, onUpdate, isDark }: {
  member: PipelineTeamMember;
  onUpdate: (field: 'received' | 'qualified', value: number) => void;
  isDark: boolean;
}) {
  const rate = member.received > 0
    ? `${Math.round((member.qualified / member.received) * 100)}%`
    : '\u2014';
  return (
    <div
      className="rounded-lg overflow-hidden w-[185px] transition-colors"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      }}
      data-node={`tm-${member.id}`}
    >
      <div
        className="h-[44px] flex items-center gap-2.5 px-3"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        }}
      >
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
          }}
        >
          {member.initials}
        </div>
        <div>
          <div className="font-semibold text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
            {member.label}
          </div>
          <div className="text-[7px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
            {member.role}
          </div>
        </div>
      </div>
      <div className="px-3 py-1.5 flex justify-between">
        <div>
          <LeadsEditableCell value={member.received} onSave={(v) => onUpdate('received', v)} isDark={isDark} />
          <div className="text-[7px] uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
            received
          </div>
        </div>
        <div>
          <LeadsEditableCell value={member.qualified} onSave={(v) => onUpdate('qualified', v)} isDark={isDark} />
          <div className="text-[7px] uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
            qualified
          </div>
        </div>
        <div>
          <div className="text-[13px] font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
            {rate}
          </div>
          <div className="text-[7px] uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
            rate
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DealSummary                                                        */
/* ------------------------------------------------------------------ */

function DealSummary({ signers, channels, onUpdate, isDark }: {
  signers: DealSigner[];
  channels: LeadChannel[];
  onUpdate: (id: string, value: number) => void;
  isDark: boolean;
}) {
  const totalDeals = signers.reduce((sum, s) => sum + s.dealsSigned, 0);
  const totalLeads = channels.reduce((sum, c) => sum + c.leadsPerMonth, 0);
  const conversion = totalLeads > 0 ? `${((totalDeals / totalLeads) * 100).toFixed(1)}%` : '\u2014';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const labelColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const numColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)';
  const sepColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div
      className="rounded-lg px-6 py-3.5 inline-flex gap-5 items-center"
      style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${borderColor}` }}
      data-node="deals"
    >
      {signers.map((s, i) => (
        <React.Fragment key={s.id}>
          <div>
            <div className="text-[8px] uppercase tracking-wider" style={{ color: labelColor }}>{s.label}</div>
            <LeadsEditableCell value={s.dealsSigned} onSave={(v) => onUpdate(s.id, v)} isDark={isDark} size="lg" />
          </div>
          {i < signers.length - 1 && <div className="w-px h-6" style={{ background: sepColor }} />}
        </React.Fragment>
      ))}
      <div className="w-px h-6" style={{ background: sepColor }} />
      <div>
        <div className="text-[8px] uppercase tracking-wider" style={{ color: labelColor }}>Total Clients</div>
        <div className="text-xl font-semibold" style={{ color: numColor }}>{totalDeals}</div>
      </div>
      <div className="w-px h-6" style={{ background: sepColor }} />
      <div>
        <div className="text-[8px] uppercase tracking-wider" style={{ color: labelColor }}>Conversion</div>
        <div className="text-xl font-semibold" style={{ color: numColor }}>{conversion}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PipelineLines — SVG overlay                                        */
/* ------------------------------------------------------------------ */

function PipelineLines({ canvasRef, connections, isDark }: {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  connections: PipelineConnections;
  isDark: boolean;
}) {
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; opacity: number }[]>([]);

  const computeLines = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const newLines: typeof lines = [];

    const getBottom = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - cr.left, y: r.bottom - cr.top };
    };
    const getTop = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - cr.left, y: r.top - cr.top };
    };
    const addLine = (from: { x: number; y: number }, to: { x: number; y: number }, opacity = 0.08) => {
      newLines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, opacity });
    };
    const node = (id: string) => canvas.querySelector(`[data-node="${id}"]`);

    // Sources -> both websites
    const webFH = node('web-fh');
    const webMI = node('web-mi');
    for (const cat of connections.sourcesToWebsites) {
      const el = node(`cat-${cat}`);
      if (!el) continue;
      const from = getBottom(el);
      if (webFH) addLine(from, getTop(webFH), 0.07);
      if (webMI) addLine(from, getTop(webMI), 0.07);
    }

    // Websites -> channels
    for (const web of [webFH, webMI]) {
      if (!web) continue;
      for (const chId of connections.websitesToChannels) {
        const ch = node(`ch-${chId}`);
        if (ch) addLine(getBottom(web), getTop(ch), 0.1);
      }
    }

    // Partners -> channels
    const partners = node('cat-partners');
    if (partners) {
      for (const chId of connections.partnersToChannels) {
        const ch = node(`ch-${chId}`);
        if (ch) addLine(getBottom(partners), getTop(ch), 0.12);
      }
    }

    // Ads -> channels
    const ads = node('cat-ads');
    if (ads) {
      for (const chId of connections.adsToChannels) {
        const ch = node(`ch-${chId}`);
        if (ch) addLine(getBottom(ads), getTop(ch), chId === 'adsform' ? 0.15 : 0.05);
      }
    }

    // Channels -> Director
    const dir = node('tm-director');
    if (dir) {
      for (const chId of connections.channelsToDirector) {
        const ch = node(`ch-${chId}`);
        if (ch) addLine(getBottom(ch), getTop(dir), 0.12);
      }
    }

    // Channels -> Digital
    const dig = node('tm-digital');
    if (dig) {
      for (const chId of connections.channelsToDigital) {
        const ch = node(`ch-${chId}`);
        if (ch) addLine(getBottom(ch), getTop(dig), 0.12);
      }
    }

    // Director/Digital -> Agents/Hunter
    for (const tmId of ['tm-director', 'tm-digital']) {
      const tm = node(tmId);
      if (!tm) continue;
      for (const targetId of ['tm-agents', 'tm-hunter']) {
        const target = node(targetId);
        if (target) addLine(getBottom(tm), getTop(target), 0.1);
      }
    }

    // Agents/Hunter -> Deals
    const deals = node('deals');
    if (deals) {
      for (const targetId of ['tm-agents', 'tm-hunter']) {
        const target = node(targetId);
        if (target) addLine(getBottom(target), getTop(deals), 0.1);
      }
    }

    setLines(newLines);
  }, [canvasRef, connections]);

  useEffect(() => {
    const timer = setTimeout(computeLines, 100);
    return () => clearTimeout(timer);
  }, [computeLines]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(computeLines);
    observer.observe(canvas);
    window.addEventListener('resize', computeLines);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', computeLines);
    };
  }, [canvasRef, computeLines]);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'}
          strokeWidth={1}
          opacity={l.opacity}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  LeadsView — main export                                            */
/* ------------------------------------------------------------------ */

export default function LeadsView() {
  const { data, updateSourceLeads, updateChannelLeads, updateTeamMember, updateDealSigner } = useLeads();
  const isDark = true;
  const canvasRef = useRef<HTMLDivElement>(null);

  const sourcesByCategory = useMemo(() => {
    const map = new Map<string, LeadSource[]>();
    for (const s of data.sources) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return map;
  }, [data.sources]);

  return (
    <div className="relative" ref={canvasRef}>
      <PipelineLines canvasRef={canvasRef} connections={data.connections} isDark={isDark} />

      {/* Row 1: Medias, FB Groups, Social Media, Publicite */}
      <div className="flex flex-wrap gap-5 justify-center items-start mb-9" style={{ position: 'relative', zIndex: 1 }}>
        <SourceCategoryGroup label="Médias" sources={sourcesByCategory.get('medias') || []} dataNode="cat-medias" onUpdate={updateSourceLeads} isDark={isDark} />
        <SourceCategoryGroup label="Facebook Groups" sources={sourcesByCategory.get('fbGroups') || []} gridClass="grid grid-cols-3" dataNode="cat-fbGroups" onUpdate={updateSourceLeads} isDark={isDark} />
        <SourceCategoryGroup label="Social Media" sources={sourcesByCategory.get('socialMedia') || []} gridClass="grid grid-cols-2" dataNode="cat-socialMedia" onUpdate={updateSourceLeads} isDark={isDark} />
        <SourceCategoryGroup label="Publicité" sources={sourcesByCategory.get('ads') || []} dataNode="cat-ads" onUpdate={updateSourceLeads} isDark={isDark} />
      </div>

      {/* Row 2: SEO, Websites, Partenaires */}
      <div className="flex flex-wrap gap-5 justify-center items-start mb-9" style={{ position: 'relative', zIndex: 1 }}>
        <SourceCategoryGroup label="SEO" sources={sourcesByCategory.get('seo') || []} dataNode="cat-seo" onUpdate={updateSourceLeads} isDark={isDark} />
        <SourceCategoryGroup label="Sites Web" sources={sourcesByCategory.get('websites') || []} dataNode="cat-websites" onUpdate={updateSourceLeads} isDark={isDark} />
        <SourceCategoryGroup label="Partenaires" sources={sourcesByCategory.get('partners') || []} dataNode="cat-partners" onUpdate={updateSourceLeads} isDark={isDark} />
      </div>

      {/* Row 3: Channels */}
      <div className="flex flex-wrap gap-2 justify-center items-start mb-9" style={{ position: 'relative', zIndex: 1 }}>
        {data.channels.map(ch => (
          <ChannelCard key={ch.id} channel={ch} onUpdate={(v) => updateChannelLeads(ch.id, v)} isDark={isDark} />
        ))}
      </div>

      {/* Row 4: Director + Digital Coordinator */}
      <div className="flex flex-wrap gap-3 justify-center items-start mb-9" style={{ position: 'relative', zIndex: 1 }}>
        {data.team.filter(t => t.id === 'director' || t.id === 'digital').map(tm => (
          <TeamCard key={tm.id} member={tm} onUpdate={(f, v) => updateTeamMember(tm.id, f, v)} isDark={isDark} />
        ))}
      </div>

      {/* Row 5: Agents + Property Hunter */}
      <div className="flex flex-wrap gap-3 justify-center items-start mb-9" style={{ position: 'relative', zIndex: 1 }}>
        {data.team.filter(t => t.id === 'agents' || t.id === 'hunter').map(tm => (
          <TeamCard key={tm.id} member={tm} onUpdate={(f, v) => updateTeamMember(tm.id, f, v)} isDark={isDark} />
        ))}
      </div>

      {/* Row 6: Deal Summary */}
      <div className="flex justify-center mb-4" style={{ position: 'relative', zIndex: 1 }}>
        <DealSummary signers={data.dealSigners} channels={data.channels} onUpdate={updateDealSigner} isDark={isDark} />
      </div>
    </div>
  );
}
