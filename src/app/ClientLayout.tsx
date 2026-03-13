'use client';

import { FinancialProvider } from '@/context/FinancialContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { MobileNavProvider } from '@/context/MobileNavContext';
import { TeamProvider } from '@/context/TeamContext';
import { ToolsAccessProvider } from '@/context/ToolsAccessContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import RightPanel from '@/components/layout/RightPanel';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
    <CurrencyProvider>
    <FinancialProvider>
    <TeamProvider>
    <ToolsAccessProvider>
    <MobileNavProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen min-w-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <TopBar />
          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 min-w-0 px-4 py-6 md:px-8 md:py-8 overflow-auto">{children}</main>
            <RightPanel />
          </div>
          <Footer />
        </div>
      </div>
    </MobileNavProvider>
    </ToolsAccessProvider>
    </TeamProvider>
    </FinancialProvider>
    </CurrencyProvider>
    </ThemeProvider>
  );
}
