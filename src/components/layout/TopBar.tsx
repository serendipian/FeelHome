'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useMobileNav } from '@/context/MobileNavContext';

const pageTitles: Record<string, string> = {
  '/': 'P&L Overview',
  '/summary': 'P&L Overview',
  '/revenues': 'Revenue Breakdown',
  '/expenses': 'Expense Detail',
  '/investment': 'Investment Simulation',
  '/team': 'Team Structure',
  '/workflow': 'Workflows',
};

export default function TopBar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { currency, isUSD, toggleCurrency } = useCurrency();
  const { toggleSidebar, togglePanel } = useMobileNav();
  const title = pageTitles[pathname] || pageTitles['/'];
  const isDark = theme === 'dark';

  return (
    <div
      className="flex items-center justify-between px-4 md:px-8 h-[56px] backdrop-blur-2xl shrink-0"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, rgba(6, 7, 10, 0.9) 0%, rgba(6, 7, 10, 0.7) 100%)'
          : 'rgba(255, 255, 255, 1)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.03)'
          : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleSidebar}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer"
          style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h1 className="text-[15px] md:text-[18px] font-semibold leading-tight" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)' }}>{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Settings toggle — mobile only */}
        <button
          onClick={togglePanel}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer"
          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        <button
          onClick={toggleCurrency}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
          }}
          title={isUSD ? 'Switch to MAD' : 'Switch to USD'}
        >
          <div className="relative w-[36px] h-[20px] rounded-full transition-colors duration-300" style={{
            background: isUSD ? 'rgba(29,127,243,0.3)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
          }}>
            <div
              className="absolute top-[2px] w-[16px] h-[16px] rounded-full transition-all duration-300 flex items-center justify-center"
              style={{
                left: isUSD ? '18px' : '2px',
                background: isUSD ? '#1d7ff3' : isDark ? '#1a1c22' : '#888',
                boxShadow: isUSD
                  ? '0 1px 4px rgba(29,127,243,0.4)'
                  : '0 1px 4px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontSize: '8px', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {isUSD ? '$' : 'د'}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)' }}>
            {currency}
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <div className="relative w-[36px] h-[20px] rounded-full transition-colors duration-300" style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(212,168,83,0.25)',
          }}>
            <div
              className="absolute top-[2px] w-[16px] h-[16px] rounded-full transition-all duration-300 flex items-center justify-center text-[10px]"
              style={{
                left: isDark ? '2px' : '18px',
                background: isDark ? '#1a1c22' : '#d4a853',
                boxShadow: isDark
                  ? '0 1px 4px rgba(0,0,0,0.5)'
                  : '0 1px 4px rgba(212,168,83,0.4)',
              }}
            >
              {isDark ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-[11px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)' }}>
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>
    </div>
  );
}
