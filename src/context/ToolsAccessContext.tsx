'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { loadFromSupabase, saveToSupabase } from '@/lib/supabase';
import type { ToolItem } from '@/data/tools';
import { DEFAULT_TOOLS, TEAM_ROLES } from '@/data/tools';

const timers: Record<string, ReturnType<typeof setTimeout>> = {};
function debouncedSave(key: string, value: unknown) {
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => { saveToSupabase(key, value); }, 500);
}

interface ToolsAccessContextValue {
  tools: ToolItem[];
  teamRoles: string[];
  updateTool: (id: string, updates: Partial<ToolItem>) => void;
  addTool: (tool: ToolItem) => void;
  removeTool: (id: string) => void;
  reorderTool: (toolId: string, targetId: string) => void;
}

const ToolsAccessContext = createContext<ToolsAccessContextValue | null>(null);

export function useToolsAccess(): ToolsAccessContextValue {
  const ctx = useContext(ToolsAccessContext);
  if (!ctx) throw new Error('useToolsAccess must be used within ToolsAccessProvider');
  return ctx;
}

export function ToolsAccessProvider({ children }: { children: React.ReactNode }) {
  const [tools, setTools] = useState<ToolItem[]>(DEFAULT_TOOLS);
  const readyToSave = useRef(false);
  const didHydrate = useRef(false);

  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    (async () => {
      const loaded = await loadFromSupabase<ToolItem[]>('toolsAccess', DEFAULT_TOOLS);
      const byId = new Map(loaded.map(t => [t.id, t]));
      const merged = DEFAULT_TOOLS.map(d => byId.get(d.id) ?? d);
      const defaultIds = new Set(DEFAULT_TOOLS.map(d => d.id));
      const custom = loaded.filter(t => !defaultIds.has(t.id));
      setTools([...merged, ...custom]);
      setTimeout(() => { readyToSave.current = true; }, 0);
    })();
  }, []);

  useEffect(() => {
    if (readyToSave.current) debouncedSave('toolsAccess', tools);
  }, [tools]);

  const updateTool = useCallback((id: string, updates: Partial<ToolItem>) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const addTool = useCallback((tool: ToolItem) => {
    setTools(prev => [...prev, tool]);
  }, []);

  const removeTool = useCallback((id: string) => {
    setTools(prev => prev.filter(t => t.id !== id));
  }, []);

  const reorderTool = useCallback((toolId: string, targetId: string) => {
    if (toolId === targetId) return;
    setTools(prev => {
      const src = prev.find(t => t.id === toolId);
      const tgt = prev.find(t => t.id === targetId);
      if (!src || !tgt || src.category !== tgt.category) return prev;
      const next = prev.filter(t => t.id !== toolId);
      const targetIndex = next.findIndex(t => t.id === targetId);
      next.splice(targetIndex, 0, src);
      return next;
    });
  }, []);

  return (
    <ToolsAccessContext.Provider value={{ tools, teamRoles: TEAM_ROLES, updateTool, addTool, removeTool, reorderTool }}>
      {children}
    </ToolsAccessContext.Provider>
  );
}
