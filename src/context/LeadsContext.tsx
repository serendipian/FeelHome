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
      // Merge: preserve saved values, add new defaults
      const loadedSourceIds = new Set(loaded.sources.map(s => s.id));
      const newSources = DEFAULT_LEADS_DATA.sources.filter(d => !loadedSourceIds.has(d.id));
      const loadedChannelIds = new Set(loaded.channels.map(c => c.id));
      const newChannels = DEFAULT_LEADS_DATA.channels.filter(d => !loadedChannelIds.has(d.id));
      const loadedTeamIds = new Set(loaded.team.map(t => t.id));
      const newTeam = DEFAULT_LEADS_DATA.team.filter(d => !loadedTeamIds.has(d.id));
      const loadedSignerIds = new Set(loaded.dealSigners.map(s => s.id));
      const newSigners = DEFAULT_LEADS_DATA.dealSigners.filter(d => !loadedSignerIds.has(d.id));
      setData({
        sources: [...loaded.sources, ...newSources],
        channels: [...loaded.channels, ...newChannels],
        team: [...loaded.team, ...newTeam],
        dealSigners: [...loaded.dealSigners, ...newSigners],
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
