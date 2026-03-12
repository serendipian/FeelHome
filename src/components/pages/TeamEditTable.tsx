'use client';

import { useTheme } from '@/context/ThemeContext';
import { useTeam } from '@/context/TeamContext';
import { useFinancial } from '@/context/FinancialContext';
import { useCurrency } from '@/context/CurrencyContext';
import { TEAM_DISPLAY, getIcon } from '@/data/team';
import type { CommissionType } from '@/types/team';

export default function TeamEditTable() {
  const { isDark } = useTheme();
  const { teamData, updateTeamMember, updateKPI, addKPI, removeKPI, updateResponsibility, addResponsibility, removeResponsibility } = useTeam();
  const { expenseItems } = useFinancial();
  const { currency } = useCurrency();

  function fmt(n: number) {
    const v = currency === 'USD' ? n / 10 : n;
    return v.toLocaleString('fr-MA') + ` ${currency}`;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fadeIn">
      {teamData.map((member) => {
        const display = TEAM_DISPLAY[member.id];
        const color = display?.color || '#888';
        const initials = display?.initials || member.id.substring(0, 2).toUpperCase();

        const expense = expenseItems.find(e => e.label === member.expenseLabel);
        const totalCost = expense?.y1 ?? 0;
        const isCDI = member.contract === 'CDI';
        const baseSalary = isCDI ? Math.round(totalCost / 1.26) : totalCost;

        // Shared styles
        const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff';
        const rowBg = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(15,23,42,0.015)';
        const rowBorder = isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(15,23,42,0.05)';
        const labelCls = `text-[9px] font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-white/30' : 'text-slate-400'}`;
        const valueCls = `text-[11px] font-semibold ${isDark ? 'text-white/80' : 'text-slate-700'}`;
        const inputBase = `bg-transparent outline-none text-[11px] font-medium w-full transition-colors ${
          isDark
            ? 'text-white/85 placeholder:text-white/15 focus:text-white'
            : 'text-slate-700 placeholder:text-slate-300 focus:text-slate-900'
        }`;

        return (
          <div
            key={member.id}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: cardBg,
              border: `1px solid ${color}18`,
              boxShadow: isDark
                ? `0 4px 32px rgba(0,0,0,0.3), 0 0 0 1px ${color}08, inset 0 1px 0 rgba(255,255,255,0.02)`
                : `0 4px 24px rgba(15,23,42,0.06), 0 0 0 1px ${color}10`,
            }}
          >
            {/* ── Card Header ── */}
            <div
              className="px-5 py-4 flex items-center gap-3.5"
              style={{
                background: isDark
                  ? `linear-gradient(135deg, ${color}0c 0%, transparent 100%)`
                  : `linear-gradient(135deg, ${color}06 0%, transparent 100%)`,
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.06)'}`,
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `${color}12`,
                  border: `2px solid ${color}30`,
                  boxShadow: `0 0 16px ${color}10`,
                }}
              >
                <span className="text-[11px] font-bold tracking-wider" style={{ color }}>{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <input
                  value={member.title}
                  onChange={(e) => updateTeamMember(member.id, { title: e.target.value })}
                  className={`${inputBase} font-bold text-[14px] tracking-tight`}
                  style={{ color }}
                />
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[8px] font-semibold uppercase tracking-[0.1em] ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
                    {member.expenseLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Card Body ── */}
            <div className="flex-1 px-5 py-4 space-y-5">

              {/* ▸ Contract & Schedule */}
              <EditSection label="Contract & Schedule" color={color} isDark={isDark}>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InputField label="Contract" labelCls={labelCls}>
                    <select
                      value={member.contract}
                      onChange={(e) => updateTeamMember(member.id, { contract: e.target.value as 'CDI' | 'CDD' | 'Freelance' })}
                      className={`${inputBase} cursor-pointer rounded-md px-2.5 py-1.5`}
                      style={{ background: rowBg, border: rowBorder }}
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </InputField>
                  <InputField label="Start Month" labelCls={labelCls}>
                    <div
                      className="flex items-center gap-1 rounded-md px-2.5 py-1.5"
                      style={{ background: rowBg, border: rowBorder }}
                    >
                      <span className={`text-[10px] font-mono ${isDark ? 'text-white/25' : 'text-slate-400'}`}>M</span>
                      <input
                        type="number"
                        min={1}
                        max={36}
                        value={member.startMonth}
                        onChange={(e) => updateTeamMember(member.id, { startMonth: Math.max(1, Math.min(36, Number(e.target.value))) })}
                        className={`${inputBase} w-10 font-mono`}
                      />
                    </div>
                  </InputField>
                  <InputField label="Status" labelCls={labelCls}>
                    <select
                      value={member.schedule.status}
                      onChange={(e) => updateTeamMember(member.id, { schedule: { ...member.schedule, status: e.target.value as 'Full-time' | 'Part-time' } })}
                      className={`${inputBase} cursor-pointer rounded-md px-2.5 py-1.5`}
                      style={{ background: rowBg, border: rowBorder }}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </InputField>
                  <InputField label="Days" labelCls={labelCls}>
                    <input
                      value={member.schedule.days}
                      onChange={(e) => updateTeamMember(member.id, { schedule: { ...member.schedule, days: e.target.value } })}
                      className={`${inputBase} rounded-md px-2.5 py-1.5`}
                      style={{ background: rowBg, border: rowBorder }}
                      placeholder="Mon – Sat"
                    />
                  </InputField>
                </div>
              </EditSection>

              {/* ▸ Compensation */}
              <EditSection label="Compensation" color={color} isDark={isDark}>
                <div className="space-y-1.5">
                  <Row label="Base Salary" bg={rowBg} border={rowBorder} labelCls={labelCls}>
                    <span className={valueCls}>{fmt(baseSalary)}</span>
                  </Row>
                  {isCDI && (
                    <Row label="CNSS + AMO" bg={rowBg} border={rowBorder} labelCls={labelCls}>
                      <span className={`text-[11px] font-mono ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{fmt(totalCost - baseSalary)}</span>
                    </Row>
                  )}
                  <Row label="Total Cost" bg={`${color}06`} border={`1px solid ${color}15`} labelCls={labelCls}>
                    <span className="text-[11px] font-bold font-mono" style={{ color }}>{fmt(totalCost)}</span>
                  </Row>

                  {/* Commission rate */}
                  <div
                    className="flex items-center justify-between rounded-lg px-3 py-2.5"
                    style={{ background: `${color}08`, border: `1px solid ${color}20` }}
                  >
                    <span className={labelCls}>Commission</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={member.commission.rate}
                        onChange={(e) => updateTeamMember(member.id, {
                          commission: { ...member.commission, rate: Math.max(0, Math.min(100, Number(e.target.value))) }
                        })}
                        className={`w-12 text-right text-[12px] font-bold font-mono bg-transparent border-b-2 outline-none transition-colors ${
                          isDark ? 'border-white/10 focus:border-white/30' : 'border-slate-200 focus:border-slate-400'
                        }`}
                        style={{ color }}
                      />
                      <span className="text-[12px] font-bold font-mono" style={{ color }}>%</span>
                    </div>
                  </div>

                  {/* Commission type */}
                  <Row label="Type" bg={rowBg} border={rowBorder} labelCls={labelCls}>
                    <select
                      value={member.commission.type}
                      onChange={(e) => updateTeamMember(member.id, {
                        commission: { ...member.commission, type: e.target.value as CommissionType }
                      })}
                      className={`text-[11px] font-semibold bg-transparent outline-none cursor-pointer ${isDark ? 'text-white/70' : 'text-slate-600'}`}
                    >
                      <option value="All Revenues">All Revenues</option>
                      <option value="Linked Deals">Linked Deals</option>
                    </select>
                  </Row>
                </div>
              </EditSection>

              {/* ▸ Languages */}
              <EditSection label="Languages" color={color} isDark={isDark}>
                <input
                  value={member.languages.join(', ')}
                  onChange={(e) => updateTeamMember(member.id, { languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className={`${inputBase} rounded-lg px-3 py-2.5`}
                  style={{ background: rowBg, border: rowBorder }}
                  placeholder="FR, EN, AR"
                />
              </EditSection>

              {/* ▸ Main Tasks */}
              <EditSection label="Main Tasks" color={color} isDark={isDark}>
                <div className="space-y-1.5">
                  {member.responsibilities.map((r, i) => (
                    <div
                      key={i}
                      className="group/task flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-all duration-150"
                      style={{ background: rowBg, border: rowBorder }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${color}0c`, color: `${color}70` }}
                      >
                        {getIcon(r.iconKey)}
                      </div>
                      <input
                        value={r.label}
                        onChange={(e) => updateResponsibility(member.id, i, 'label', e.target.value)}
                        className={`${inputBase} flex-1 font-medium`}
                      />
                      <button
                        onClick={() => removeResponsibility(member.id, i)}
                        className={`opacity-0 group-hover/task:opacity-100 text-[9px] shrink-0 w-5 h-5 flex items-center justify-center rounded-md transition-all ${
                          isDark ? 'text-white/20 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-300 hover:text-red-400 hover:bg-red-50'
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <AddButton label="Add task" color={color} onClick={() => addResponsibility(member.id)} isDark={isDark} />
                </div>
              </EditSection>

              {/* ▸ Skills & Tools */}
              <EditSection label="Skills & Tools" color={color} isDark={isDark}>
                <div className="space-y-3">
                  <InputField label="Skills" labelCls={labelCls}>
                    <input
                      value={member.skills.join(', ')}
                      onChange={(e) => updateTeamMember(member.id, { skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className={`${inputBase} rounded-lg px-3 py-2.5`}
                      style={{ background: rowBg, border: rowBorder }}
                      placeholder="Skill 1, Skill 2, ..."
                    />
                  </InputField>
                  <InputField label="Tools" labelCls={labelCls}>
                    <input
                      value={member.tools.join(', ')}
                      onChange={(e) => updateTeamMember(member.id, { tools: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className={`${inputBase} rounded-lg px-3 py-2.5`}
                      style={{ background: rowBg, border: rowBorder }}
                      placeholder="Tool 1, Tool 2, ..."
                    />
                  </InputField>
                </div>
              </EditSection>

              {/* ▸ KPIs */}
              <EditSection label="KPIs" color={color} isDark={isDark}>
                <div className="space-y-1.5">
                  {member.kpis.map((k, i) => (
                    <div
                      key={i}
                      className="group/kpi flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-150"
                      style={{ background: rowBg, border: rowBorder }}
                    >
                      <input
                        value={k.label}
                        onChange={(e) => updateKPI(member.id, i, 'label', e.target.value)}
                        className={`${inputBase} flex-1 font-medium`}
                        placeholder="KPI name"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          value={k.target}
                          onChange={(e) => updateKPI(member.id, i, 'target', e.target.value)}
                          className={`${inputBase} w-24 font-mono text-right font-semibold`}
                          style={{ color }}
                          placeholder="Target"
                        />
                        <button
                          onClick={() => removeKPI(member.id, i)}
                          className={`opacity-0 group-hover/kpi:opacity-100 text-[9px] shrink-0 w-5 h-5 flex items-center justify-center rounded-md transition-all ${
                            isDark ? 'text-white/20 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-300 hover:text-red-400 hover:bg-red-50'
                          }`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <AddButton label="Add KPI" color={color} onClick={() => addKPI(member.id)} isDark={isDark} />
                </div>
              </EditSection>

            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Shared sub-components ───────────────────────────────────────────────

function EditSection({ label, color, isDark, children }: { label: string; color: string; isDark: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-1 h-3.5 rounded-full" style={{ background: `${color}50` }} />
        <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-white/35' : 'text-slate-500'}`}>
          {label}
        </span>
        <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }} />
      </div>
      {children}
    </div>
  );
}

function InputField({ label, labelCls, children }: { label: string; labelCls: string; children: React.ReactNode }) {
  return (
    <div>
      <span className={`${labelCls} mb-1 block`}>{label}</span>
      {children}
    </div>
  );
}

function Row({ label, bg, border, labelCls, children }: {
  label: string; bg: string; border: string; labelCls: string; children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg px-3 py-2.5"
      style={{ background: bg, border }}
    >
      <span className={labelCls}>{label}</span>
      {children}
    </div>
  );
}

function AddButton({ label, color, onClick, isDark }: { label: string; color: string; onClick: () => void; isDark: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-[10px] font-semibold px-3 py-2.5 rounded-lg transition-all duration-200 text-center group/add"
      style={{
        color: `${color}80`,
        background: 'transparent',
        border: `1px dashed ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)'}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}08`;
        e.currentTarget.style.borderColor = `${color}30`;
        e.currentTarget.style.color = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)';
        e.currentTarget.style.color = `${color}80`;
      }}
    >
      + {label}
    </button>
  );
}
