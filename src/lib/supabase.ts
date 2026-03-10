import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function loadFromSupabase<T>(key: string, fallback: T): Promise<T> {
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('data')
      .eq('id', key)
      .single();
    if (error || !data || data.data === null) return fallback;
    return data.data as T;
  } catch {
    return fallback;
  }
}

export async function saveToSupabase(key: string, value: unknown): Promise<void> {
  try {
    await supabase
      .from('app_state')
      .upsert({ id: key, data: value, updated_at: new Date().toISOString() });
  } catch {}
}

// Bump this to force a one-time reset of cached Supabase data (e.g. after reordering defaults)
const DATA_VERSION = 7;

// Version-aware singleton — re-runs migration if DATA_VERSION changes (handles HMR)
let migrationPromise: Promise<void> | null = null;
let migrationVersion = 0;

export function ensureMigrated(): Promise<void> {
  if (!migrationPromise || migrationVersion !== DATA_VERSION) {
    migrationVersion = DATA_VERSION;
    migrationPromise = (async () => {
      try {
        const stored = await loadFromSupabase<number>('dataVersion', 0);
        if (stored >= DATA_VERSION) return;
        const baseKeys = ['saleRevenues', 'rentalRevenues', 'mediaRevenues', 'expenseItems', 'simdata'];
        const scenarios = ['pessimistic', 'optimistic', 'realistic'];
        const keysToReset = [
          ...baseKeys,
          ...baseKeys.flatMap(k => scenarios.map(s => `${k}_${s}`)),
          'activeScenario', // reset to force realistic on next hydration
        ];
        await Promise.all(keysToReset.map(k => saveToSupabase(k, null)));
        await saveToSupabase('dataVersion', DATA_VERSION);
      } catch {}
    })();
  }
  return migrationPromise;
}
