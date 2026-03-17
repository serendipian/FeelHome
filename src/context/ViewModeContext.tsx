'use client';

import { createContext, useContext, useState } from 'react';

interface ViewModeContextValue {
  isYearly: boolean;
  setIsYearly: (v: boolean) => void;
}

const ViewModeContext = createContext<ViewModeContextValue>({
  isYearly: false,
  setIsYearly: () => {},
});

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [isYearly, setIsYearly] = useState(false);
  return (
    <ViewModeContext.Provider value={{ isYearly, setIsYearly }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
