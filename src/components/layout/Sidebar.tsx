'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useMobileNav } from '@/context/MobileNavContext';

const navItems = [
  { href: '/revenues', label: 'Revenues', icon: TrendUpIcon },
  { href: '/expenses', label: 'Expenses', icon: TrendDownIcon },
  { href: '/investment', label: 'Investment', icon: DollarIcon },
  { href: '/team', label: 'Team', icon: TeamIcon },
  { href: '/workflow', label: 'Workflow', icon: WorkflowIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { isDark } = useTheme();
  const { sidebarOpen, closeSidebar } = useMobileNav();

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{
          width: collapsed ? 72 : 240,
          background: isDark
            ? 'linear-gradient(180deg, rgba(10, 12, 16, 0.98) 0%, rgba(6, 7, 10, 0.99) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 250, 252, 1) 100%)',
          borderRight: isDark
            ? '1px solid rgba(255,255,255,0.04)'
            : '1px solid rgba(15,23,42,0.08)',
          boxShadow: isDark ? 'none' : '2px 0 12px rgba(15,23,42,0.04)',
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
              <span className="text-[13px] font-bold tracking-tight" style={{ color: isDark ? '#fff' : '#1e293b' }}>Feel Home</span>
              <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.3)' }}>Ecosystem</span>
            </div>
          )}
        </div>

        <div className="mx-4 h-px" style={{
          background: isDark
            ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)'
            : 'linear-gradient(to right, transparent, rgba(15,23,42,0.06), transparent)',
        }} />

        <nav className="flex-1 py-5 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group"
                style={{
                  color: isActive
                    ? (isDark ? '#fff' : '#1e293b')
                    : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.35)'),
                }}
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

        <div className="px-3 pb-3 hidden md:block">
          <div className="mx-1 mb-3 h-px" style={{
            background: isDark
              ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)'
              : 'linear-gradient(to right, transparent, rgba(15,23,42,0.06), transparent)',
          }} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center h-9 rounded-xl transition-all duration-200 cursor-pointer"
            style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.25)' }}
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
    </>
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

function TeamIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function WorkflowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}
