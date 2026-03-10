'use client';

import { FinancialProvider } from '@/context/FinancialContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinancialProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-[220px] flex flex-col min-h-screen transition-all duration-300">
          <TopBar />
          <main className="flex-1 px-8 py-6 overflow-auto">{children}</main>
          <Footer />
        </div>
      </div>
    </FinancialProvider>
  );
}
