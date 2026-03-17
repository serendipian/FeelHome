'use client';

import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { getIcon } from '@/data/team';
import type { MergedTeamMember } from '@/data/team';

interface OrgMemberModalProps {
  member: MergedTeamMember | null;
  onClose: () => void;
}

const CONTRACT_COLORS: Record<string, { bg: string; text: string }> = {
  CDI: { bg: 'rgba(239,68,68,0.12)', text: '#f87171' },
  CDD: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' },
  Freelance: { bg: 'rgba(29,127,243,0.12)', text: '#60a5fa' },
};

const BRAND_INFO: Record<string, { label: string; color: string }> = {
  feelHome: { label: 'Feel Home', color: '#d4a853' },
  mInvest: { label: 'M Invest', color: '#1d7ff3' },
  expats: { label: 'Expats.ma', color: '#2dd4bf' },
};

export default function OrgMemberModal({ member, onClose }: OrgMemberModalProps) {
  const { isDark } = useTheme();

  // Close on Escape
  useEffect(() => {
    if (!member) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [member, onClose]);

  if (!member) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-[340px] max-w-full overflow-y-auto transition-transform duration-300 ease-out"
        style={{
          background: isDark ? 'rgba(10,12,20,0.97)' : 'rgba(255,255,255,0.98)',
          borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
        }}
      >
        <div className="p-6">
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)' }}
            >
              <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)' }}>✕</span>
            </button>
          </div>

          {/* Section 1: Header */}
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{
                background: `${member.color}15`,
                border: `2px solid ${member.color}`,
              }}
            >
              <span style={{ color: member.color, fontSize: 18, fontWeight: 700 }}>
                {member.initials}
              </span>
            </div>
            <div style={{ color: member.color, fontSize: 16, fontWeight: 700 }}>{member.title}</div>
            {member.scope && (
              <div className="mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)', fontSize: 11 }}>
                {member.scope}
              </div>
            )}
            <div className="flex justify-center gap-1.5 mt-2">
              {member.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Section 2: Schedule */}
          <SectionLabel label="SCHEDULE" isDark={isDark} />
          <div className="grid grid-cols-2 gap-2 mb-5">
            <InfoCell label="Contract" value={member.contract} isDark={isDark} />
            <InfoCell label="Start" value={`Month ${member.startMonth}`} isDark={isDark} />
            <InfoCell label="Status" value={member.schedule.status} isDark={isDark} />
            <InfoCell label="Hours" value={member.schedule.hours} isDark={isDark} />
          </div>

          {/* Section 3: Responsibilities */}
          <SectionLabel label="RESPONSIBILITIES" isDark={isDark} />
          <div className="flex flex-col gap-1 mb-5">
            {member.responsibilities.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md"
                style={{ background: `${member.color}08`, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)' }}
              >
                <span style={{ color: member.color }}>{getIcon(r.iconKey)}</span>
                <span className="text-[11px]">{r.label}</span>
              </div>
            ))}
          </div>

          {/* Section 4: Compensation */}
          <SectionLabel label="COMPENSATION" isDark={isDark} />
          <div
            className="rounded-lg p-3 mb-5"
            style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)' }}
          >
            {member.commission.rate > 0 ? (
              <div className="flex justify-between">
                <span className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)' }}>Commission</span>
                <span className="text-[11px] font-semibold" style={{ color: member.color }}>
                  {member.commission.rate}% {member.commission.type}
                </span>
              </div>
            ) : (
              <div className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)' }}>
                No commission
              </div>
            )}
          </div>

          {/* Section 5: Skills & Tools */}
          <SectionLabel label="SKILLS" isDark={isDark} />
          <div className="flex flex-wrap gap-1 mb-3">
            {member.skills.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-md text-[10px]"
                style={{ background: `${member.color}12`, color: `${member.color}B3` }}
              >
                {s}
              </span>
            ))}
          </div>
          <SectionLabel label="TOOLS" isDark={isDark} />
          <div className="flex flex-wrap gap-1 mb-5">
            {member.tools.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md text-[10px]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
                  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Section 6: KPIs */}
          <SectionLabel label="KPIs" isDark={isDark} />
          <div className="flex flex-col gap-1.5 mb-5">
            {member.kpis.map((kpi, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-2 py-1.5 rounded-md"
                style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)' }}
              >
                <span className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)' }}>
                  {kpi.label}
                </span>
                <span className="text-[11px] font-semibold font-mono" style={{ color: '#2dd4bf' }}>
                  {kpi.target}
                </span>
              </div>
            ))}
          </div>

          {/* Section 7: Brand Affiliation / Market */}
          {member.brands && member.brands.length > 0 && (
            <>
              <SectionLabel label="BRANDS" isDark={isDark} />
              <div className="flex flex-wrap gap-2">
                {member.brands.map((b) => {
                  const info = BRAND_INFO[b];
                  if (!info) return null;
                  return (
                    <div
                      key={b}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                      style={{
                        background: `${info.color}0A`,
                        border: `1px solid ${info.color}20`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ background: `${info.color}25` }}
                      >
                        <span style={{ color: info.color, fontSize: 7, fontWeight: 700 }}>
                          {info.label.split(' ').map(w => w[0]).join('')}
                        </span>
                      </div>
                      <span style={{ color: `${info.color}B3`, fontSize: 10 }}>{info.label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {member.location && !member.brands?.length && (
            <>
              <SectionLabel label="MARKET" isDark={isDark} />
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{
                  background: `${member.color}0A`,
                  border: `1px solid ${member.color}20`,
                }}
              >
                <span style={{ color: `${member.color}B3`, fontSize: 11 }}>{member.location}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function SectionLabel({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <div
      className="text-[9px] font-semibold tracking-[2px] mb-2"
      style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)' }}
    >
      {label}
    </div>
  );
}

function InfoCell({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <div
      className="rounded-lg px-2.5 py-2"
      style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)' }}
    >
      <div className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)' }}>{label}</div>
      <div className="text-[12px] font-semibold mt-0.5" style={{ color: isDark ? '#fff' : '#1e293b' }}>{value}</div>
    </div>
  );
}
