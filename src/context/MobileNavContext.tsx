'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface MobileNavState {
  sidebarOpen: boolean;
  panelOpen: boolean;
  toggleSidebar: () => void;
  togglePanel: () => void;
  closeSidebar: () => void;
  closePanel: () => void;
}

const MobileNavContext = createContext<MobileNavState>({
  sidebarOpen: false,
  panelOpen: false,
  toggleSidebar: () => {},
  togglePanel: () => {},
  closeSidebar: () => {},
  closePanel: () => {},
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
    setPanelOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setPanelOpen(prev => !prev);
    setSidebarOpen(false);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  return (
    <MobileNavContext.Provider value={{ sidebarOpen, panelOpen, toggleSidebar, togglePanel, closeSidebar, closePanel }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export const useMobileNav = () => useContext(MobileNavContext);
