'use client';

import { useTheme } from '@/context/ThemeContext';
import { formatNumber } from '@/lib/formatters';

export default function TotalBar({
  label,
  values,
  color = '#d4a853',
}: {
  label: string;
  values: [number, number, number];
  color?: string;
}) {
  const { isDark } = useTheme();

  const bgStyle = {
    background: `linear-gradient(135deg, ${color}06 0%, ${color}02 100%)`,
    border: `1px solid ${color}15`,
    boxShadow: isDark
      ? `0 -4px 24px rgba(0,0,0,0.3), inset 0 1px 0 ${color}08`
      : `0 -4px 24px rgba(15,23,42,0.06), inset 0 1px 0 ${color}08`,
  };

  return (
    <div className="sticky bottom-0 z-10 flex gap-3">
      <div
        className="w-1/2 flex items-center px-4 py-4 rounded-2xl backdrop-blur-2xl"
        style={bgStyle}
      >
        <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="w-1/2 flex gap-3">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center py-4 rounded-2xl backdrop-blur-2xl"
            style={bgStyle}
          >
            <div className="font-mono text-[13px] font-bold" style={{ color }}>{formatNumber(Math.round(v))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
