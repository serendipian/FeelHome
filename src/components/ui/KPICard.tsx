'use client';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: string;
  icon: React.ReactNode;
  bars?: number[];
  trend?: 'up' | 'down';
}

export default function KPICard({ title, value, subtitle, color, icon, bars, trend }: KPICardProps) {
  const maxBar = bars ? Math.max(...bars.map(Math.abs), 1) : 1;

  return (
    <div className="card p-6 flex flex-col gap-4 group relative overflow-hidden">
      {/* Subtle glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
        style={{ background: `${color}15` }}
      />

      <div className="flex items-center justify-between relative">
        <span className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.15em]">{title}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 group-hover:opacity-70 transition-all duration-300"
          style={{ background: `${color}10` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>

      <div className="relative">
        <div className="font-mono text-[28px] font-bold tracking-tight leading-none" style={{ color }}>
          {value}
        </div>
        {subtitle && (
          <div className="flex items-center gap-1.5 mt-2">
            {trend && (
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke={trend === 'up' ? '#2dd4bf' : '#f43f5e'}
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={trend === 'up' ? 'M4.5 19.5l15-15M12 4.5h7.5V12' : 'M4.5 4.5l15 15M19.5 12v7.5H12'}
                />
              </svg>
            )}
            <span className="text-[11px] text-white/30 font-medium">{subtitle}</span>
          </div>
        )}
      </div>

      {bars && bars.length > 0 && (
        <div className="flex items-end gap-[3px] h-10 mt-auto pt-2">
          {bars.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-[3px] transition-all duration-700 ease-out"
              style={{
                height: `${Math.max((Math.abs(v) / maxBar) * 100, 4)}%`,
                background: v >= 0
                  ? `linear-gradient(to top, ${color}30, ${color}60)`
                  : 'linear-gradient(to top, #f43f5e30, #f43f5e60)',
                boxShadow: v >= 0 ? `0 -2px 8px ${color}15` : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
