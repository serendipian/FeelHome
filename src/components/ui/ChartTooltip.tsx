'use client';

import { formatMAD } from '@/lib/formatters';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

export default function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(17,19,24,0.97) 0%, rgba(10,12,16,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}40` }} />
            <span className="text-white/50">{entry.name}</span>
            <span className="font-mono font-semibold text-white ml-auto">{formatMAD(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
