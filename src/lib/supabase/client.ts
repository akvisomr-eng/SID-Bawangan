import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { createDemoSupabaseBrowserClient } from './demo-client';

const FULL_TRIAL_KEY = 'sid-bawangan-full-admin-trial-v1';

export function createSupabaseBrowserClient() {
  if (typeof window !== 'undefined' && window.localStorage.getItem(FULL_TRIAL_KEY) === '1') {
    return createDemoSupabaseBrowserClient();
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient<Database>(url, key);
}
