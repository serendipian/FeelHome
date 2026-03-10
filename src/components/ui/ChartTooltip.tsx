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
    <div className="bg-[#1a1d25] border border-white/10 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-xs text-white/50 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-white/70">{entry.name}:</span>
          <span className="font-mono font-semibold text-white">{formatMAD(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}
