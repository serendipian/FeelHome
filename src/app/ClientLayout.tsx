'use client';

import { FinancialProvider } from '@/context/FinancialContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import RightPanel from '@/components/layout/RightPanel';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinancialProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-[240px] flex flex-col min-h-screen transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <TopBar />
          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 px-8 py-8 overflow-auto">{children}</main>
            <RightPanel />
          </div>
          <Footer />
        </div>
      </div>
    </FinancialProvider>
  );
}
