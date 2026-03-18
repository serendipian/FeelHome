'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { loadFromSupabase, saveToSupabase } from '@/lib/supabase';
import type { LeadsPipelineData } from '@/types/leads';
import { DEFAULT_LEADS_DATA } from '@/data/leads';

const timers: Record<string, ReturnType<typeof setTimeout>> = {};
function debouncedSave(key: string, value: unknown) {
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => { saveToSupabase(key, value); }, 500);
}

interface LeadsContextValue {
  data: LeadsPipelineData;
  updateSourceLeads: (id: string, value: number) => void;
  updateSourceImage: (id: string, imageUrl: string) => void;
  updateChannelLeads: (id: string, value: number) => void;
  updateTeamMember: (id: string, field: 'received' | 'qualified', value: number) => void;
  updateDealSigner: (id: string, value: number) => void;
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function useLeads(): LeadsContextValue {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
}

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<LeadsPipelineData>(DEFAULT_LEADS_DATA);
  const readyToSave = useRef(false);
  const didHydrate = useRef(false);

  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    (async () => {
      const loaded = await loadFromSupabase<LeadsPipelineData>('leadsPipeline', DEFAULT_LEADS_DATA);
      // Merge: use defaults as base, overlay saved numeric values
      const loadedSourceMap = new Map(loaded.sources.map(s => [s.id, s]));
      const mergedSources = DEFAULT_LEADS_DATA.sources.map(def => {
        const saved = loadedSourceMap.get(def.id);
        return saved ? { ...def, leadsPerMonth: saved.leadsPerMonth } : def;
      });
      // Add any saved sources not in defaults
      const defaultSourceIds = new Set(DEFAULT_LEADS_DATA.sources.map(s => s.id));
      const extraSources = loaded.sources.filter(s => !defaultSourceIds.has(s.id));

      const loadedChannelMap = new Map(loaded.channels.map(c => [c.id, c]));
      const mergedChannels = DEFAULT_LEADS_DATA.channels.map(def => {
        const saved = loadedChannelMap.get(def.id);
        return saved ? { ...def, leadsPerMonth: saved.leadsPerMonth } : def;
      });
      const defaultChannelIds = new Set(DEFAULT_LEADS_DATA.channels.map(c => c.id));
      const extraChannels = loaded.channels.filter(c => !defaultChannelIds.has(c.id));

      const loadedTeamMap = new Map(loaded.team.map(t => [t.id, t]));
      const mergedTeam = DEFAULT_LEADS_DATA.team.map(def => {
        const saved = loadedTeamMap.get(def.id);
        return saved ? { ...def, received: saved.received, qualified: saved.qualified } : def;
      });
      const defaultTeamIds = new Set(DEFAULT_LEADS_DATA.team.map(t => t.id));
      const extraTeam = loaded.team.filter(t => !defaultTeamIds.has(t.id));

      const loadedSignerMap = new Map(loaded.dealSigners.map(s => [s.id, s]));
      const mergedSigners = DEFAULT_LEADS_DATA.dealSigners.map(def => {
        const saved = loadedSignerMap.get(def.id);
        return saved ? { ...def, dealsSigned: saved.dealsSigned } : def;
      });
      const defaultSignerIds = new Set(DEFAULT_LEADS_DATA.dealSigners.map(s => s.id));
      const extraSigners = loaded.dealSigners.filter(s => !defaultSignerIds.has(s.id));

      setData({
        sources: [...mergedSources, ...extraSources],
        channels: [...mergedChannels, ...extraChannels],
        team: [...mergedTeam, ...extraTeam],
        dealSigners: [...mergedSigners, ...extraSigners],
        connections: loaded.connections ?? DEFAULT_LEADS_DATA.connections,
      });
      setTimeout(() => { readyToSave.current = true; }, 0);
    })();
  }, []);

  useEffect(() => {
    if (readyToSave.current) debouncedSave('leadsPipeline', data);
  }, [data]);

  const updateSourceLeads = useCallback((id: string, value: number) => {
    setData(prev => ({
      ...prev,
      sources: prev.sources.map(s => s.id === id ? { ...s, leadsPerMonth: value } : s),
    }));
  }, []);

  const updateSourceImage = useCallback((id: string, imageUrl: string) => {
    setData(prev => ({
      ...prev,
      sources: prev.sources.map(s => s.id === id ? { ...s, imageUrl } : s),
    }));
  }, []);

  const updateChannelLeads = useCallback((id: string, value: number) => {
    setData(prev => ({
      ...prev,
      channels: prev.channels.map(c => c.id === id ? { ...c, leadsPerMonth: value } : c),
    }));
  }, []);

  const updateTeamMember = useCallback((id: string, field: 'received' | 'qualified', value: number) => {
    setData(prev => ({
      ...prev,
      team: prev.team.map(t => t.id === id ? { ...t, [field]: value } : t),
    }));
  }, []);

  const updateDealSigner = useCallback((id: string, value: number) => {
    setData(prev => ({
      ...prev,
      dealSigners: prev.dealSigners.map(s => s.id === id ? { ...s, dealsSigned: value } : s),
    }));
  }, []);

  return (
    <LeadsContext.Provider value={{ data, updateSourceLeads, updateSourceImage, updateChannelLeads, updateTeamMember, updateDealSigner }}>
      {children}
    </LeadsContext.Provider>
  );
}
