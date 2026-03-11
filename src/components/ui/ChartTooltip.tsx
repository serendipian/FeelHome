'use client';

import { useTheme } from '@/context/ThemeContext';
import { useCurrencyFormatters } from '@/context/CurrencyContext';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

export default function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  const { isDark } = useTheme();
  const { fMAD } = useCurrencyFormatters();

  if (!active || !payload) return null;

  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl backdrop-blur-xl"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(17,19,24,0.97) 0%, rgba(10,12,16,0.98) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.99) 100%)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.1)',
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(15,23,42,0.12)',
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)' }}>{label}</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}40` }} />
            <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)' }}>{entry.name}</span>
            <span className="font-mono font-semibold ml-auto" style={{ color: isDark ? '#fff' : '#1e293b' }}>{fMAD(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
