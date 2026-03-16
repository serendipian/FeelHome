'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface MobileNavState {
  sidebarOpen: boolean;
  panelOpen: boolean;
  sidebarCollapsed: boolean;
  panelCollapsed: boolean;
  toggleSidebar: () => void;
  togglePanel: () => void;
  closeSidebar: () => void;
  closePanel: () => void;
  toggleSidebarCollapsed: () => void;
  togglePanelCollapsed: () => void;
}

const MobileNavContext = createContext<MobileNavState>({
  sidebarOpen: false,
  panelOpen: false,
  sidebarCollapsed: false,
  panelCollapsed: false,
  toggleSidebar: () => {},
  togglePanel: () => {},
  closeSidebar: () => {},
  closePanel: () => {},
  toggleSidebarCollapsed: () => {},
  togglePanelCollapsed: () => {},
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

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
  const toggleSidebarCollapsed = useCallback(() => setSidebarCollapsed(prev => !prev), []);
  const togglePanelCollapsed = useCallback(() => setPanelCollapsed(prev => !prev), []);

  return (
    <MobileNavContext.Provider value={{ sidebarOpen, panelOpen, sidebarCollapsed, panelCollapsed, toggleSidebar, togglePanel, closeSidebar, closePanel, toggleSidebarCollapsed, togglePanelCollapsed }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export const useMobileNav = () => useContext(MobileNavContext);
