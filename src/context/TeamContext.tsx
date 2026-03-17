'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { loadFromSupabase, saveToSupabase } from '@/lib/supabase';
import { useFinancial } from '@/context/FinancialContext';
import type { TeamMemberData, CommissionType } from '@/types/team';
import type { IconKey } from '@/types/team';
import { DEFAULT_TEAM_DATA } from '@/data/team';

// ── Debounced save (same pattern as FinancialContext) ────────────────────

const teamTimers: Record<string, ReturnType<typeof setTimeout>> = {};
function debouncedSave(key: string, value: unknown) {
  clearTimeout(teamTimers[key]);
  teamTimers[key] = setTimeout(() => { saveToSupabase(key, value); }, 500);
}

async function loadScenarioValue<T>(key: string, scenario: string, fallback: T): Promise<T> {
  const prefixed = await loadFromSupabase<T | null>(`${key}_${scenario}`, null);
  if (prefixed !== null) return prefixed;
  if (scenario === 'realistic') {
    return loadFromSupabase<T>(key, fallback);
  }
  return fallback;
}

// ── Context shape ────────────────────────────────────────────────────────

interface TeamContextValue {
  teamData: TeamMemberData[];
  updateTeamMember: (id: string, updates: Partial<TeamMemberData>) => void;
  updateKPI: (id: string, index: number, field: 'label' | 'target', value: string) => void;
  addKPI: (id: string) => void;
  removeKPI: (id: string, index: number) => void;
  updateResponsibility: (id: string, index: number, field: 'label' | 'iconKey', value: string) => void;
  addResponsibility: (id: string) => void;
  removeResponsibility: (id: string, index: number) => void;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function useTeam(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────────

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { activeScenario } = useFinancial();
  const [teamData, setTeamData] = useState<TeamMemberData[]>(DEFAULT_TEAM_DATA);

  const readyToSave = useRef(false);
  const didHydrate = useRef(false);
  const scenarioRef = useRef(activeScenario);

  // Hydrate from Supabase on mount
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    (async () => {
      const loaded = await loadScenarioValue<TeamMemberData[]>('teamData', activeScenario, DEFAULT_TEAM_DATA);
      // Ensure all default members exist; always use code-defined title/expenseLabel
      const byId = new Map(loaded.map(m => [m.id, m]));
      const merged = DEFAULT_TEAM_DATA.map(d => {
        const saved = byId.get(d.id);
        if (!saved) return d;
        return { ...saved, title: d.title, expenseLabel: d.expenseLabel };
      });
      setTeamData(merged);
      setTimeout(() => { readyToSave.current = true; }, 0);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change
  useEffect(() => {
    if (readyToSave.current) {
      debouncedSave(`teamData_${scenarioRef.current}`, teamData);
    }
  }, [teamData]);

  // Handle scenario switches
  useEffect(() => {
    if (scenarioRef.current === activeScenario) return;
    const prevScenario = scenarioRef.current;
    scenarioRef.current = activeScenario;

    readyToSave.current = false;
    // Save current data to previous scenario, then load new
    (async () => {
      await saveToSupabase(`teamData_${prevScenario}`, teamData);
      const loaded = await loadScenarioValue<TeamMemberData[]>('teamData', activeScenario, DEFAULT_TEAM_DATA);
      const byId = new Map(loaded.map(m => [m.id, m]));
      const merged = DEFAULT_TEAM_DATA.map(d => {
        const saved = byId.get(d.id);
        if (!saved) return d;
        return { ...saved, title: d.title, expenseLabel: d.expenseLabel };
      });
      setTeamData(merged);
      setTimeout(() => { readyToSave.current = true; }, 0);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScenario]);

  // ── Update functions ───────────────────────────────────────────────────

  const updateTeamMember = useCallback((id: string, updates: Partial<TeamMemberData>) => {
    setTeamData(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const updateKPI = useCallback((id: string, index: number, field: 'label' | 'target', value: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      const kpis = [...m.kpis];
      kpis[index] = { ...kpis[index], [field]: value };
      return { ...m, kpis };
    }));
  }, []);

  const addKPI = useCallback((id: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, kpis: [...m.kpis, { label: 'New KPI', target: '0/mo' }] };
    }));
  }, []);

  const removeKPI = useCallback((id: string, index: number) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, kpis: m.kpis.filter((_, i) => i !== index) };
    }));
  }, []);

  const updateResponsibility = useCallback((id: string, index: number, field: 'label' | 'iconKey', value: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      const responsibilities = [...m.responsibilities];
      responsibilities[index] = { ...responsibilities[index], [field]: value as IconKey };
      return { ...m, responsibilities };
    }));
  }, []);

  const addResponsibility = useCallback((id: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, responsibilities: [...m.responsibilities, { iconKey: 'target' as IconKey, label: 'New task' }] };
    }));
  }, []);

  const removeResponsibility = useCallback((id: string, index: number) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, responsibilities: m.responsibilities.filter((_, i) => i !== index) };
    }));
  }, []);

  return (
    <TeamContext.Provider value={{
      teamData,
      updateTeamMember,
      updateKPI,
      addKPI,
      removeKPI,
      updateResponsibility,
      addResponsibility,
      removeResponsibility,
    }}>
      {children}
    </TeamContext.Provider>
  );
}
