'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/summary', label: 'Summary', icon: GridIcon },
  { href: '/revenues', label: 'Revenues', icon: TrendUpIcon },
  { href: '/expenses', label: 'Expenses', icon: TrendDownIcon },
  { href: '/investment', label: 'Investment', icon: DollarIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        width: collapsed ? 72 : 240,
        background: 'linear-gradient(180deg, rgba(10, 12, 16, 0.98) 0%, rgba(6, 7, 10, 0.99) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex items-center gap-3 px-5 h-[72px]">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{
            background: 'linear-gradient(135deg, #d4a853, #d4875a)',
            boxShadow: '0 4px 12px rgba(212, 168, 83, 0.25)',
          }}
        >
          FH
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-white tracking-tight">Feel Home</span>
            <span className="text-[10px] text-white/25 font-medium tracking-wider uppercase">Ecosystem</span>
          </div>
        )}
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <nav className="flex-1 py-5 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                isActive
                  ? 'text-white'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              {isActive && (
                <>
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.08) 0%, rgba(212, 168, 83, 0.02) 100%)',
                      border: '1px solid rgba(212, 168, 83, 0.12)',
                    }}
                  />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#d4a853] shadow-[0_0_8px_rgba(212,168,83,0.4)]" />
                </>
              )}
              <item.icon className="w-[18px] h-[18px] shrink-0 relative z-10" />
              {!collapsed && <span className="whitespace-nowrap relative z-10">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <div className="mx-1 mb-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center h-9 rounded-xl text-white/20 hover:text-white/50 hover:bg-white/[0.02] transition-all duration-200"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
