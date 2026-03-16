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
  const { isDark } = useTheme();
  const { currency, isUSD, toggleCurrency } = useCurrency();
  const { toggleSidebar, togglePanel } = useMobileNav();
  const title = pageTitles[pathname] || pageTitles['/'];

  return (
    <div
      className="relative z-10 flex items-center justify-between px-4 md:px-8 h-[56px] backdrop-blur-2xl shrink-0"
      style={{
        background: 'rgba(255, 255, 255, 1)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleSidebar}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer"
          style={{ color: 'rgba(0,0,0,0.5)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h1 className="text-[15px] md:text-[18px] font-semibold leading-tight" style={{ color: 'rgba(0,0,0,0.85)' }}>{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Settings toggle — mobile only */}
        <button
          onClick={togglePanel}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer"
          style={{ color: 'rgba(0,0,0,0.4)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        <button
          onClick={toggleCurrency}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer"
          style={{
            background: 'rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.12)',
          }}
          title={isUSD ? 'Switch to MAD' : 'Switch to USD'}
        >
          <div className="relative w-[36px] h-[20px] rounded-full transition-colors duration-300" style={{
            background: isUSD ? 'rgba(29,127,243,0.3)' : 'rgba(0,0,0,0.1)',
          }}>
            <div
              className="absolute top-[2px] w-[16px] h-[16px] rounded-full transition-all duration-300 flex items-center justify-center"
              style={{
                left: isUSD ? '18px' : '2px',
                background: isUSD ? '#1d7ff3' : '#888',
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
          <span className="text-[11px] font-medium" style={{ color: 'rgba(0,0,0,0.55)' }}>
            {currency}
          </span>
        </button>
      </div>
    </div>
  );
}
