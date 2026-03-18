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

// ── Always use optimistic scenario as source of truth for shared fields ──

async function applyOptimisticSharedFields(data: TeamMemberData[], scenario: string): Promise<TeamMemberData[]> {
  if (scenario === 'optimistic') return data;
  const optimisticData = await loadScenarioValue<TeamMemberData[]>('teamData', 'optimistic', DEFAULT_TEAM_DATA);
  const optimisticById = new Map(optimisticData.map(m => [m.id, m]));
  return data.map(m => {
    const opt = optimisticById.get(m.id);
    if (!opt) return m;
    return {
      ...m,
      responsibilities: opt.responsibilities,
      contract: opt.contract,
      startMonth: opt.startMonth,
      languages: opt.languages,
      schedule: opt.schedule,
      skills: opt.skills,
      tools: opt.tools,
      kpis: opt.kpis,
    };
  });
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
      let merged = DEFAULT_TEAM_DATA.map(d => {
        const saved = byId.get(d.id);
        if (!saved) return d;
        return { ...saved, title: d.title, expenseLabel: d.expenseLabel };
      });
      // Always use optimistic shared fields as source of truth
      merged = await applyOptimisticSharedFields(merged, activeScenario);
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
      let merged = DEFAULT_TEAM_DATA.map(d => {
        const saved = byId.get(d.id);
        if (!saved) return d;
        return { ...saved, title: d.title, expenseLabel: d.expenseLabel };
      });
      // Always use optimistic shared fields as source of truth
      merged = await applyOptimisticSharedFields(merged, activeScenario);
      setTeamData(merged);
      setTimeout(() => { readyToSave.current = true; }, 0);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScenario]);

  // ── Update functions ───────────────────────────────────────────────────

  // Fields that are shared across all scenarios (everything except commission)
  const SHARED_FIELDS = new Set(['contract', 'startMonth', 'languages', 'schedule', 'skills', 'tools', 'responsibilities', 'kpis']);

  // Sync a shared-field change across all scenarios
  const syncAcrossScenarios = useCallback(async (id: string, updater: (member: TeamMemberData) => TeamMemberData) => {
    const allScenarios = ['optimistic', 'realistic', 'pessimistic'];
    const currentScenario = scenarioRef.current;
    const otherScenarios = allScenarios.filter(s => s !== currentScenario);

    for (const scenario of otherScenarios) {
      const loaded = await loadScenarioValue<TeamMemberData[]>('teamData', scenario, DEFAULT_TEAM_DATA);
      const updated = loaded.map(m => m.id === id ? updater(m) : m);
      await saveToSupabase(`teamData_${scenario}`, updated);
    }
  }, []);

  const updateTeamMember = useCallback((id: string, updates: Partial<TeamMemberData>) => {
    setTeamData(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    // Sync shared fields to other scenarios
    const sharedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => SHARED_FIELDS.has(key))
    );
    if (Object.keys(sharedUpdates).length > 0) {
      syncAcrossScenarios(id, (m) => ({ ...m, ...sharedUpdates }));
    }
  }, [syncAcrossScenarios]);

  const updateKPI = useCallback((id: string, index: number, field: 'label' | 'target', value: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      const kpis = [...m.kpis];
      kpis[index] = { ...kpis[index], [field]: value };
      return { ...m, kpis };
    }));
    syncAcrossScenarios(id, (m) => {
      const kpis = [...m.kpis];
      if (index < kpis.length) {
        kpis[index] = { ...kpis[index], [field]: value };
      }
      return { ...m, kpis };
    });
  }, [syncAcrossScenarios]);

  const addKPI = useCallback((id: string) => {
    const newKPI = { label: 'New KPI', target: '0/mo' };
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, kpis: [...m.kpis, newKPI] };
    }));
    syncAcrossScenarios(id, (m) => ({ ...m, kpis: [...m.kpis, newKPI] }));
  }, [syncAcrossScenarios]);

  const removeKPI = useCallback((id: string, index: number) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, kpis: m.kpis.filter((_, i) => i !== index) };
    }));
    syncAcrossScenarios(id, (m) => ({ ...m, kpis: m.kpis.filter((_, i) => i !== index) }));
  }, [syncAcrossScenarios]);

  const updateResponsibility = useCallback((id: string, index: number, field: 'label' | 'iconKey', value: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      const responsibilities = [...m.responsibilities];
      responsibilities[index] = { ...responsibilities[index], [field]: value as IconKey };
      return { ...m, responsibilities };
    }));
    syncAcrossScenarios(id, (m) => {
      const responsibilities = [...m.responsibilities];
      if (index < responsibilities.length) {
        responsibilities[index] = { ...responsibilities[index], [field]: value as IconKey };
      }
      return { ...m, responsibilities };
    });
  }, [syncAcrossScenarios]);

  const addResponsibility = useCallback((id: string) => {
    const newResp = { iconKey: 'target' as IconKey, label: 'New task' };
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, responsibilities: [...m.responsibilities, newResp] };
    }));
    syncAcrossScenarios(id, (m) => ({ ...m, responsibilities: [...m.responsibilities, newResp] }));
  }, [syncAcrossScenarios]);

  const removeResponsibility = useCallback((id: string, index: number) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, responsibilities: m.responsibilities.filter((_, i) => i !== index) };
    }));
    syncAcrossScenarios(id, (m) => ({ ...m, responsibilities: m.responsibilities.filter((_, i) => i !== index) }));
  }, [syncAcrossScenarios]);

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
