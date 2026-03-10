'use client';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: string;
  icon: React.ReactNode;
  bars?: number[];
}

export default function KPICard({ title, value, subtitle, color, icon, bars }: KPICardProps) {
  const maxBar = bars ? Math.max(...bars.map(Math.abs), 1) : 1;

  return (
    <div className="card p-5 flex flex-col gap-3 group hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{title}</span>
        <span style={{ color }} className="opacity-60 group-hover:opacity-100 transition-opacity">
          {icon}
        </span>
      </div>
      <div className="font-mono text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      {subtitle && <div className="text-xs text-white/40">{subtitle}</div>}
      {bars && bars.length > 0 && (
        <div className="flex items-end gap-1 h-8 mt-1">
          {bars.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-500"
              style={{
                height: `${(Math.abs(v) / maxBar) * 100}%`,
                backgroundColor: v >= 0 ? `${color}60` : '#f43f5e60',
                minHeight: 2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
