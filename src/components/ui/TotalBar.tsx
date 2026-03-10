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
      className="sticky bottom-0 z-10 flex items-center justify-between px-6 py-3 rounded-xl border backdrop-blur-xl"
      style={{
        backgroundColor: `${color}08`,
        borderColor: `${color}30`,
      }}
    >
      <span className="text-sm font-semibold" style={{ color }}>
        {label}
      </span>
      <div className="flex gap-12 font-mono text-sm font-bold" style={{ color }}>
        {values.map((v, i) => (
          <span key={i}>{formatMAD(v)}</span>
        ))}
      </div>
    </div>
  );
}
