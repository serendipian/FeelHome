'use client';

import { FinancialProvider } from '@/context/FinancialContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { MobileNavProvider, useMobileNav } from '@/context/MobileNavContext';
import { TeamProvider } from '@/context/TeamContext';
import { ToolsAccessProvider } from '@/context/ToolsAccessContext';
import { LeadsProvider } from '@/context/LeadsContext';
import { ViewModeProvider } from '@/context/ViewModeContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import RightPanel from '@/components/layout/RightPanel';
import Footer from '@/components/layout/Footer';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useMobileNav();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-md:!ml-0"
        style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
      >
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 min-w-0 px-4 py-6 md:px-8 md:py-8 overflow-auto">{children}</main>
          <RightPanel />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
    <CurrencyProvider>
    <FinancialProvider>
    <TeamProvider>
    <ToolsAccessProvider>
    <LeadsProvider>
    <ViewModeProvider>
    <MobileNavProvider>
      <LayoutShell>{children}</LayoutShell>
    </MobileNavProvider>
    </ViewModeProvider>
    </LeadsProvider>
    </ToolsAccessProvider>
    </TeamProvider>
    </FinancialProvider>
    </CurrencyProvider>
    </ThemeProvider>
  );
}
