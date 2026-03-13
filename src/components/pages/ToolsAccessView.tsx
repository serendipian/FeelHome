'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useToolsAccess } from '@/context/ToolsAccessContext';
import type { ToolItem, ToolCategory, ToolStatus, Currency } from '@/data/tools';
import { CATEGORY_COLORS } from '@/data/tools';

// ── Inline editable text cell ────────────────────────────────────────────

function EditableText({
  value,
  onSave,
  placeholder,
  isPassword,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  isPassword?: boolean;
}) {
  const { isDark } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [showPassword, setShowPassword] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && ref.current) { ref.current.focus(); ref.current.select(); }
  }, [editing]);

  const commit = () => {
    onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={ref}
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="w-full rounded-md px-2.5 py-1.5 text-[12px] outline-none"
        style={{
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)',
          border: '1px solid rgba(212,168,83,0.5)',
          color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.85)',
          boxShadow: '0 0 0 3px rgba(212,168,83,0.1)',
        }}
        placeholder={placeholder}
      />
    );
  }

  if (isPassword && value) {
    return (
      <span className="flex items-center gap-1.5 group">
        <span
          onClick={() => { setDraft(value); setEditing(true); }}
          className="cursor-pointer rounded-md px-2.5 py-1.5 transition-all hover:bg-[#d4a853]/10 text-[12px]"
          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)' }}
          title="Click to edit"
        >
          {showPassword ? value : '••••••••'}
        </span>
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)' }}
          title={showPassword ? 'Hide' : 'Show'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {showPassword ? (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            ) : (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </span>
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      className="cursor-pointer rounded-md px-2.5 py-1.5 transition-all hover:bg-[#d4a853]/10 text-[12px] block truncate"
      style={{ color: value ? (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)') : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)') }}
      title={value || placeholder || 'Click to edit'}
    >
      {value || placeholder || '—'}
    </span>
  );
}

// ── Editable number cell ─────────────────────────────────────────────────

function EditableNumber({
  value,
  onSave,
}: {
  value: number;
  onSave: (v: number) => void;
}) {
  const { isDark } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && ref.current) { ref.current.focus(); ref.current.select(); }
  }, [editing]);

  const commit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) onSave(parsed);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={ref}
        type="number"
        step="1"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="w-full rounded-md px-2.5 py-1.5 text-right text-[12px] font-mono outline-none"
        style={{
          minWidth: 60,
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)',
          border: '1px solid rgba(212,168,83,0.5)',
          color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.85)',
          boxShadow: '0 0 0 3px rgba(212,168,83,0.1)',
        }}
      />
    );
  }

  return (
    <span
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="cursor-pointer rounded-md px-2.5 py-1.5 transition-all hover:bg-[#d4a853]/10 text-[12px] font-mono text-right block"
      style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)' }}
      title="Click to edit"
    >
      {value === 0 ? '—' : value.toLocaleString('fr-MA')}
    </span>
  );
}

// ── Dropdown select ──────────────────────────────────────────────────────

function Dropdown<T extends string>({
  value,
  options,
  onSelect,
  placeholder,
  colorMap,
}: {
  value: T;
  options: T[];
  onSelect: (v: T) => void;
  placeholder?: string;
  colorMap?: Record<string, string>;
}) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const color = colorMap?.[value];

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left rounded-md px-2.5 py-1.5 text-[12px] transition-all hover:bg-[#d4a853]/10 flex items-center gap-1.5"
        style={{ color: value ? (color || (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)')) : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)') }}
      >
        {color && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />}
        <span className="truncate">{value || placeholder || '—'}</span>
        <svg className="w-3 h-3 ml-auto shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 w-full min-w-[160px] rounded-lg py-1 shadow-xl border max-h-48 overflow-y-auto"
          style={{
            background: isDark ? '#1a1d24' : '#fff',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)',
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
              : '0 8px 32px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.06)',
          }}
        >
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center gap-2"
              style={{
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
                background: opt === value ? (isDark ? 'rgba(212,168,83,0.1)' : 'rgba(212,168,83,0.06)') : 'transparent',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = opt === value ? (isDark ? 'rgba(212,168,83,0.1)' : 'rgba(212,168,83,0.06)') : 'transparent'; }}
            >
              {colorMap?.[opt] && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colorMap[opt] }} />}
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Multi-select dropdown ────────────────────────────────────────────────

function MultiSelect({
  selected,
  options,
  onChange,
  placeholder,
}: {
  selected: string[];
  options: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left rounded-md px-2.5 py-1.5 text-[12px] transition-all hover:bg-[#d4a853]/10 flex items-center gap-1"
        style={{ color: selected.length ? (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)') : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)') }}
      >
        <span className="truncate flex-1">
          {selected.length ? selected.join(', ') : placeholder || '—'}
        </span>
        <svg className="w-3 h-3 shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 w-full min-w-[180px] rounded-lg py-1 shadow-xl border max-h-48 overflow-y-auto"
          style={{
            background: isDark ? '#1a1d24' : '#fff',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)',
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
              : '0 8px 32px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.06)',
          }}
        >
          {options.map(opt => {
            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className="w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center gap-2"
                style={{
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
                  background: isSelected ? (isDark ? 'rgba(212,168,83,0.1)' : 'rgba(212,168,83,0.06)') : 'transparent',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = isSelected ? (isDark ? 'rgba(212,168,83,0.1)' : 'rgba(212,168,83,0.06)') : 'transparent'; }}
              >
                <span
                  className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0"
                  style={{
                    borderColor: isSelected ? '#d4a853' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)'),
                    background: isSelected ? '#d4a853' : 'transparent',
                  }}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ToolStatus, string> = {
  active: '#10b981',
  inactive: '#6b7280',
  pending: '#f59e0b',
};

function StatusBadge({ status, onChange }: { status: ToolStatus; onChange: (s: ToolStatus) => void }) {
  return (
    <Dropdown
      value={status}
      options={['active', 'inactive', 'pending'] as ToolStatus[]}
      onSelect={onChange}
      colorMap={STATUS_COLORS}
    />
  );
}

// ── Currency selector ────────────────────────────────────────────────────

function CurrencySelect({ value, onChange }: { value: Currency; onChange: (c: Currency) => void }) {
  return (
    <Dropdown
      value={value}
      options={['MAD', 'USD', 'EUR'] as Currency[]}
      onSelect={onChange}
    />
  );
}

// ── SVG Donut Chart ──────────────────────────────────────────────────────

function DonutChart({
  segments,
  size = 80,
  stroke = 7,
  isDark,
  centerLabel,
  centerSub,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  isDark: boolean;
  centerLabel: string;
  centerSub?: string;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.05)'}
          strokeWidth={stroke}
        />
        {total > 0 && segments.filter(s => s.value > 0).map((seg, i) => {
          const pct = seg.value / total;
          const dashLen = pct * circumference;
          const gap = circumference - dashLen;
          const el = (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${dashLen} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={{ transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)' }}
            />
          );
          offset += dashLen;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[14px] font-bold leading-none" style={{ color: isDark ? '#fff' : '#1e293b' }}>
          {centerLabel}
        </span>
        {centerSub && (
          <span className="text-[8px] font-medium mt-0.5 uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.35)' }}>
            {centerSub}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Legend row ────────────────────────────────────────────────────────────

function LegendItem({
  color,
  label,
  value,
  isDark,
}: {
  color: string;
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: color }} />
      <span className="text-[10px] truncate flex-1" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)' }}>
        {label}
      </span>
      <span className="text-[10px] font-semibold tabular-nums shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.65)' }}>
        {value}
      </span>
    </div>
  );
}

// ── Stacked bar (horizontal, for cost breakdown) ─────────────────────────

function StackedBar({
  segments,
  isDark,
}: {
  segments: { value: number; color: string; label: string }[];
  isDark: boolean;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;
  return (
    <div
      className="flex h-[6px] rounded-full overflow-hidden"
      style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.05)' }}
    >
      {segments.filter(s => s.value > 0).map((seg, i) => (
        <div
          key={i}
          className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
          style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
          title={`${seg.label}: ${seg.value.toLocaleString('fr-MA')}`}
        />
      ))}
    </div>
  );
}

// ── Drag handle icon ─────────────────────────────────────────────────────

function DragHandle({ isDark }: { isDark: boolean }) {
  return (
    <span
      className="cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)' }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" />
        <circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="15" cy="19" r="1.5" />
      </svg>
    </span>
  );
}

// ── Role colors ──────────────────────────────────────────────────────────

const ROLE_COLORS = ['#d4a853', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'];

// ── Main View ────────────────────────────────────────────────────────────

export default function ToolsAccessView() {
  const { isDark } = useTheme();
  const { tools, teamRoles, updateTool, addTool, removeTool, reorderTool } = useToolsAccess();
  const [filterCategory, setFilterCategory] = useState<ToolCategory | 'all'>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const categories: ToolCategory[] = ['Communication', 'Website', 'SaaS', 'MLS', 'Social Media', 'Communities', 'Ads'];

  const filteredTools = useMemo(() => {
    let result = tools;
    if (filterCategory !== 'all') result = result.filter(t => t.category === filterCategory);
    if (filterRole !== 'all') result = result.filter(t => t.responsible === filterRole || t.otherUsers.includes(filterRole));
    return result;
  }, [tools, filterCategory, filterRole]);

  // Group by category preserving order
  const grouped = useMemo(() => {
    const map = new Map<ToolCategory, ToolItem[]>();
    for (const cat of categories) {
      const items = filteredTools.filter(t => t.category === cat);
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTools]);

  // ── Stats ──
  const activeCount = tools.filter(t => t.status === 'active').length;
  const inactiveCount = tools.length - activeCount;

  // Cost breakdown by category per currency
  const costByCategory = useMemo(() => {
    const mad: { label: string; value: number; color: string }[] = [];
    const usd: { label: string; value: number; color: string }[] = [];
    for (const cat of categories) {
      const catTools = tools.filter(t => t.category === cat);
      const madSum = catTools.reduce((s, t) => s + (t.currency === 'MAD' ? t.monthlyCost : 0), 0);
      const usdSum = catTools.reduce((s, t) => s + (t.currency === 'USD' ? t.monthlyCost : t.currency === 'EUR' ? t.monthlyCost : 0), 0);
      if (madSum > 0) mad.push({ label: cat, value: madSum, color: CATEGORY_COLORS[cat] });
      if (usdSum > 0) usd.push({ label: cat, value: usdSum, color: CATEGORY_COLORS[cat] });
    }
    return { mad, usd };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tools]);

  const totalCostMAD = costByCategory.mad.reduce((s, d) => s + d.value, 0);
  const totalCostUSD = costByCategory.usd.reduce((s, d) => s + d.value, 0);

  // Role breakdown
  const roleBreakdown = useMemo(() => {
    return teamRoles.map(role => ({
      role,
      count: tools.filter(t => t.responsible === role || t.otherUsers.includes(role)).length,
    }));
  }, [tools, teamRoles]);

  const handleAddTool = () => {
    const id = `custom-${Date.now()}`;
    addTool({
      id,
      category: filterCategory === 'all' ? 'SaaS' : filterCategory,
      name: 'New Tool',
      description: '',
      responsible: '',
      otherUsers: [],
      monthlyCost: 0,
      currency: 'MAD',
      username: '',
      password: '',
      status: 'active',
    });
  };

  // ── Drag handlers ──
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    if (dragId && dragOverId && dragId !== dragOverId) {
      reorderTool(dragId, dragOverId);
    }
    setDragId(null);
    setDragOverId(null);
  }, [dragId, dragOverId, reorderTool]);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  }, []);

  const cardBg = isDark
    ? 'rgba(255,255,255,0.02)'
    : 'rgba(255,255,255,0.7)';
  const cardBorder = isDark
    ? 'rgba(255,255,255,0.04)'
    : 'rgba(15,23,42,0.06)';
  const headerColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)';
  const zebraEven = isDark ? 'rgba(255,255,255,0.015)' : 'rgba(15,23,42,0.018)';
  const zebraOdd = 'transparent';
  const hoverBg = isDark ? 'rgba(212,168,83,0.06)' : 'rgba(212,168,83,0.04)';

  // Build flat rows
  let globalRowIndex = 0;
  const flatRows: ({ type: 'header'; category: ToolCategory; count: number } | { type: 'tool'; tool: ToolItem; rowIndex: number })[] = [];
  for (const [category, items] of grouped.entries()) {
    flatRows.push({ type: 'header', category, count: items.length });
    for (const tool of items) {
      flatRows.push({ type: 'tool', tool, rowIndex: globalRowIndex++ });
    }
  }

  return (
    <div className="animate-fadeIn space-y-6">
      {/* ── KPI Cards — GA-inspired ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Tools overview with donut */}
        <div
          className="rounded-2xl p-5 transition-all"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)',
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.15)' : '0 2px 12px rgba(15,23,42,0.04)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: headerColor }}>
              Tools Overview
            </span>
            <span
              className="text-[9px] font-medium px-2 py-0.5 rounded-full"
              style={{
                color: '#10b981',
                background: 'rgba(16,185,129,0.1)',
              }}
            >
              {Math.round((activeCount / Math.max(tools.length, 1)) * 100)}% active
            </span>
          </div>
          <div className="flex items-center gap-4">
            <DonutChart
              size={72}
              stroke={6}
              isDark={isDark}
              centerLabel={String(tools.length)}
              centerSub="total"
              segments={[
                { value: activeCount, color: '#10b981' },
                { value: tools.filter(t => t.status === 'pending').length, color: '#f59e0b' },
                { value: tools.filter(t => t.status === 'inactive').length, color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' },
              ]}
            />
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <LegendItem color="#10b981" label="Active" value={String(activeCount)} isDark={isDark} />
              <LegendItem color="#f59e0b" label="Pending" value={String(tools.filter(t => t.status === 'pending').length)} isDark={isDark} />
              <LegendItem color={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)'} label="Inactive" value={String(tools.filter(t => t.status === 'inactive').length)} isDark={isDark} />
            </div>
          </div>
        </div>

        {/* Card 2: Monthly MAD — cost breakdown */}
        <div
          className="rounded-2xl p-5 transition-all"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)',
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.15)' : '0 2px 12px rgba(15,23,42,0.04)',
          }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: headerColor }}>
            Monthly Cost (MAD)
          </div>
          <div className="text-[22px] font-bold tracking-tight mb-3" style={{ color: isDark ? '#fff' : '#1e293b' }}>
            {totalCostMAD > 0 ? totalCostMAD.toLocaleString('fr-MA') : '0'}
            <span className="text-[11px] font-medium ml-1" style={{ color: headerColor }}>MAD</span>
          </div>
          <StackedBar segments={costByCategory.mad} isDark={isDark} />
          <div className="flex flex-col gap-1 mt-3">
            {costByCategory.mad.map(d => (
              <LegendItem key={d.label} color={d.color} label={d.label} value={d.value.toLocaleString('fr-MA')} isDark={isDark} />
            ))}
            {costByCategory.mad.length === 0 && (
              <span className="text-[10px]" style={{ color: headerColor }}>No MAD costs yet</span>
            )}
          </div>
        </div>

        {/* Card 3: Monthly USD/EUR — cost breakdown */}
        <div
          className="rounded-2xl p-5 transition-all"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)',
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.15)' : '0 2px 12px rgba(15,23,42,0.04)',
          }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: headerColor }}>
            Monthly Cost (USD)
          </div>
          <div className="text-[22px] font-bold tracking-tight mb-3" style={{ color: isDark ? '#fff' : '#1e293b' }}>
            {totalCostUSD > 0 ? totalCostUSD.toLocaleString('en-US') : '0'}
            <span className="text-[11px] font-medium ml-1" style={{ color: headerColor }}>USD</span>
          </div>
          <StackedBar segments={costByCategory.usd} isDark={isDark} />
          <div className="flex flex-col gap-1 mt-3">
            {costByCategory.usd.map(d => (
              <LegendItem key={d.label} color={d.color} label={d.label} value={d.value.toLocaleString('en-US') + ' $'} isDark={isDark} />
            ))}
            {costByCategory.usd.length === 0 && (
              <span className="text-[10px]" style={{ color: headerColor }}>No USD costs yet</span>
            )}
          </div>
        </div>

        {/* Card 4: Role assignment — donut + legend */}
        <div
          className="rounded-2xl p-5 transition-all"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)',
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.15)' : '0 2px 12px rgba(15,23,42,0.04)',
          }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: headerColor }}>
            Access by Role
          </div>
          <div className="flex items-center gap-4">
            <DonutChart
              size={72}
              stroke={6}
              isDark={isDark}
              centerLabel={String(roleBreakdown.reduce((s, d) => s + d.count, 0))}
              centerSub="assigns"
              segments={roleBreakdown.map((d, i) => ({
                value: d.count,
                color: ROLE_COLORS[i % ROLE_COLORS.length],
              }))}
            />
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              {roleBreakdown.map((d, i) => (
                <LegendItem key={d.role} color={ROLE_COLORS[i % ROLE_COLORS.length]} label={d.role} value={String(d.count)} isDark={isDark} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters — GA-style ── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Category chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] mr-1 shrink-0" style={{ color: headerColor }}>
            Category
          </span>
          <button
            onClick={() => setFilterCategory('all')}
            className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[11px] font-medium transition-all duration-200"
            style={{
              color: filterCategory === 'all' ? (isDark ? '#fff' : '#1e293b') : headerColor,
              background: filterCategory === 'all'
                ? (isDark ? 'rgba(212,168,83,0.15)' : 'rgba(212,168,83,0.1)')
                : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)'),
              border: filterCategory === 'all'
                ? '1px solid rgba(212,168,83,0.3)'
                : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
              boxShadow: filterCategory === 'all' ? '0 1px 4px rgba(212,168,83,0.15)' : 'none',
            }}
          >
            All
            <span
              className="text-[9px] font-semibold px-1.5 py-px rounded-full ml-0.5"
              style={{
                background: filterCategory === 'all'
                  ? 'rgba(212,168,83,0.2)'
                  : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'),
                color: filterCategory === 'all' ? '#d4a853' : headerColor,
              }}
            >
              {tools.length}
            </span>
          </button>
          {categories.map(cat => {
            const isActive = filterCategory === cat;
            const color = CATEGORY_COLORS[cat];
            const count = tools.filter(t => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[11px] font-medium transition-all duration-200"
                style={{
                  color: isActive ? color : headerColor,
                  background: isActive
                    ? `${color}12`
                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)'),
                  border: isActive
                    ? `1px solid ${color}35`
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
                  boxShadow: isActive ? `0 1px 4px ${color}20` : 'none',
                }}
              >
                <span
                  className="w-[6px] h-[6px] rounded-full shrink-0"
                  style={{ background: isActive ? color : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)') }}
                />
                {cat}
                <span
                  className="text-[9px] font-semibold px-1.5 py-px rounded-full"
                  style={{
                    background: isActive ? `${color}18` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'),
                    color: isActive ? color : headerColor,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Role chips + Add button */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] mr-1 shrink-0" style={{ color: headerColor }}>
            Role
          </span>
          <button
            onClick={() => setFilterRole('all')}
            className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[11px] font-medium transition-all duration-200"
            style={{
              color: filterRole === 'all' ? (isDark ? '#fff' : '#1e293b') : headerColor,
              background: filterRole === 'all'
                ? (isDark ? 'rgba(212,168,83,0.15)' : 'rgba(212,168,83,0.1)')
                : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)'),
              border: filterRole === 'all'
                ? '1px solid rgba(212,168,83,0.3)'
                : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
              boxShadow: filterRole === 'all' ? '0 1px 4px rgba(212,168,83,0.15)' : 'none',
            }}
          >
            All
          </button>
          {teamRoles.map((role, ri) => {
            const isActive = filterRole === role;
            const color = ROLE_COLORS[ri % ROLE_COLORS.length];
            const count = tools.filter(t => t.responsible === role || t.otherUsers.includes(role)).length;
            return (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap"
                style={{
                  color: isActive ? color : headerColor,
                  background: isActive
                    ? `${color}12`
                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)'),
                  border: isActive
                    ? `1px solid ${color}35`
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
                  boxShadow: isActive ? `0 1px 4px ${color}20` : 'none',
                }}
              >
                <span
                  className="w-[6px] h-[6px] rounded-full shrink-0"
                  style={{ background: isActive ? color : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)') }}
                />
                {role}
                <span
                  className="text-[9px] font-semibold px-1.5 py-px rounded-full"
                  style={{
                    background: isActive ? `${color}18` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'),
                    color: isActive ? color : headerColor,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <div className="flex-1" />

          <button
            onClick={handleAddTool}
            className="inline-flex items-center gap-1.5 px-4 py-[6px] rounded-full text-[11px] font-semibold transition-all duration-200"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.12) 100%)'
                : 'linear-gradient(135deg, rgba(212,168,83,0.15) 0%, rgba(212,168,83,0.08) 100%)',
              color: '#d4a853',
              border: '1px solid rgba(212,168,83,0.25)',
              boxShadow: '0 1px 4px rgba(212,168,83,0.15)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Tool
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.2)'
            : '0 4px 24px rgba(15,23,42,0.04)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)',
                }}
              >
                {['', 'Tool', 'Description', 'Status', 'Administrator', 'Other Users', 'Cost/mo', 'Cur.', 'Username', 'Password', ''].map((h, i) => (
                  <th
                    key={h + i}
                    className={`py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] whitespace-nowrap ${i === 0 ? 'pl-3 pr-0 w-[28px]' : 'px-4'}`}
                    style={{
                      color: headerColor,
                      borderBottom: isDark ? '2px solid rgba(255,255,255,0.06)' : '2px solid rgba(15,23,42,0.06)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flatRows.map((row, i) => {
                if (row.type === 'header') {
                  const color = CATEGORY_COLORS[row.category];
                  return (
                    <tr key={`header-${row.category}`}>
                      <td
                        colSpan={11}
                        className="px-4 py-2.5"
                        style={{
                          background: isDark ? `${color}08` : `${color}06`,
                          borderBottom: `1px solid ${isDark ? `${color}15` : `${color}12`}`,
                          borderTop: i > 0 ? `1px solid ${cardBorder}` : undefined,
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                          <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color }}>
                            {row.category}
                          </span>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)',
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
                            }}
                          >
                            {row.count}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                const { tool, rowIndex } = row;
                const isEven = rowIndex % 2 === 0;
                const isDragOver = dragOverId === tool.id && dragId !== tool.id;

                return (
                  <tr
                    key={tool.id}
                    draggable
                    onDragStart={e => handleDragStart(e, tool.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => handleDragOver(e, tool.id)}
                    className="group transition-colors duration-150"
                    style={{
                      background: isEven ? zebraEven : zebraOdd,
                      borderBottom: `1px solid ${cardBorder}`,
                      borderTop: isDragOver ? '2px solid #d4a853' : undefined,
                    }}
                    onMouseEnter={e => { if (!dragId) (e.currentTarget as HTMLElement).style.background = hoverBg; }}
                    onMouseLeave={e => { if (!dragId) (e.currentTarget as HTMLElement).style.background = isEven ? zebraEven : zebraOdd; }}
                  >
                    <td className="pl-3 pr-0 py-2.5 w-[28px]">
                      <DragHandle isDark={isDark} />
                    </td>
                    <td className="px-4 py-2.5 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1 h-5 rounded-full shrink-0"
                          style={{ background: CATEGORY_COLORS[tool.category] + '40' }}
                        />
                        <EditableText value={tool.name} onSave={v => updateTool(tool.id, { name: v })} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 min-w-[180px]">
                      <EditableText value={tool.description} onSave={v => updateTool(tool.id, { description: v })} placeholder="Add description..." />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={tool.status} onChange={s => updateTool(tool.id, { status: s })} />
                    </td>
                    <td className="px-4 py-2.5 min-w-[140px]">
                      <Dropdown
                        value={tool.responsible}
                        options={teamRoles}
                        onSelect={v => updateTool(tool.id, { responsible: v })}
                        placeholder="Assign role..."
                      />
                    </td>
                    <td className="px-4 py-2.5 min-w-[160px]">
                      <MultiSelect
                        selected={tool.otherUsers}
                        options={teamRoles.filter(r => r !== tool.responsible)}
                        onChange={v => updateTool(tool.id, { otherUsers: v })}
                        placeholder="Select roles..."
                      />
                    </td>
                    <td className="px-4 py-2.5 min-w-[80px]">
                      <EditableNumber value={tool.monthlyCost} onSave={v => updateTool(tool.id, { monthlyCost: v })} />
                    </td>
                    <td className="px-4 py-2.5">
                      <CurrencySelect value={tool.currency} onChange={c => updateTool(tool.id, { currency: c })} />
                    </td>
                    <td className="px-4 py-2.5 min-w-[160px]">
                      <EditableText value={tool.username} onSave={v => updateTool(tool.id, { username: v })} placeholder="Username..." />
                    </td>
                    <td className="px-4 py-2.5 min-w-[130px]">
                      <EditableText value={tool.password} onSave={v => updateTool(tool.id, { password: v })} placeholder="Password..." isPassword />
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => removeTool(tool.id)}
                        className="p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)' }}
                        title="Remove tool"
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
