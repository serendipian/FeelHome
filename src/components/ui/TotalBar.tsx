'use client';

import { formatMAD } from '@/lib/formatters';

export default function TotalBar({
  label,
  values,
  color = '#d4a853',
}: {
  label: string;
  values: [number, number, number];
  color?: string;
}) {
  return (
    <div
      className="sticky bottom-0 z-10 flex items-center px-6 py-4 rounded-2xl backdrop-blur-2xl gap-3"
      style={{
        background: `linear-gradient(135deg, ${color}06 0%, ${color}02 100%)`,
        border: `1px solid ${color}15`,
        boxShadow: `0 -4px 24px rgba(0,0,0,0.3), inset 0 1px 0 ${color}08`,
      }}
    >
      <div className="w-1/2">
        <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="w-1/2 flex gap-3">
        {values.map((v, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="text-[9px] text-white/25 font-medium uppercase tracking-wider mb-0.5">Year {i + 1}</div>
            <div className="font-mono text-[13px] font-bold" style={{ color }}>{formatMAD(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
