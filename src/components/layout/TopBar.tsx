'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';

const pageTitles: Record<string, string> = {
  '/': 'P&L Overview',
  '/summary': 'P&L Overview',
  '/revenues': 'Revenue Breakdown',
  '/expenses': 'Expense Detail',
  '/investment': 'Investment Simulation',
  '/team': 'Team Structure',
};

export default function TopBar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { currency, isUSD, toggleCurrency } = useCurrency();
  const title = pageTitles[pathname] || pageTitles['/'];
  const isDark = theme === 'dark';

  return (
    <div
      className="flex items-center justify-between px-8 h-[56px] backdrop-blur-2xl shrink-0"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, rgba(6, 7, 10, 0.9) 0%, rgba(6, 7, 10, 0.7) 100%)'
          : 'rgba(255, 255, 255, 1)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.03)'
          : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <h1 className="text-[18px] font-semibold leading-tight" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)' }}>{title}</h1>

      <div className="flex items-center gap-2">
      <button
        onClick={toggleCurrency}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer"
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer"
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
