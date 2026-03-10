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
    if (error || !data) return fallback;
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
