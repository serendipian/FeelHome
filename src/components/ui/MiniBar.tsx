'use client';

import { useTheme } from '@/context/ThemeContext';

export default function MiniBar({
  value,
  max,
  color = '#d4a853',
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const { isDark } = useTheme();
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="w-20 h-[5px] rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.06)' }}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}60, ${color})`,
          boxShadow: `0 0 8px ${color}30`,
        }}
      />
    </div>
  );
}
