'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import AdminTrial from '@/components/admin/AdminTrial';

const TRIAL_KEY = 'sid-bawangan-demo-trial-start-v1';
const FULL_TRIAL_KEY = 'sid-bawangan-full-admin-trial-v1';
const TRIAL_MS = 14 * 24 * 60 * 60 * 1000;

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) {
      setAuthChecked(true);
      return;
    }

    let active = true;
    const enterFullTrial = () => {
      const storedStart = Number(window.localStorage.getItem(TRIAL_KEY));
      const startedAt = Number.isFinite(storedStart) && storedStart > 0 ? storedStart : Date.now();
      if (!window.localStorage.getItem(TRIAL_KEY)) {
        window.localStorage.setItem(TRIAL_KEY, String(startedAt));
      }
      const trialActive = Date.now() - startedAt < TRIAL_MS;
      if (trialActive && window.localStorage.getItem(FULL_TRIAL_KEY) !== '1') {
        window.localStorage.setItem(FULL_TRIAL_KEY, '1');
        window.location.reload();
        return true;
      }
      return false;
    };

    if (!supabase) {
      if (!enterFullTrial()) {
        setUser(null);
        setAuthChecked(true);
      }
      return () => { active = false; };
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) {
        setUser(data.user);
        setAuthChecked(true);
        return;
      }
      if (!enterFullTrial()) {
        setUser(null);
        setAuthChecked(true);
      }
    }).catch(() => {
      if (!active) return;
      if (!enterFullTrial()) {
        setUser(null);
        setAuthChecked(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) {
        setUser(session.user);
        setAuthChecked(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isLogin, supabase]);

  if (isLogin) return <>{children}</>;
  if (!authChecked) return <main className="sid-trial-loading">Menyiapkan ruang kerja SID Bawangan…</main>;
  if (!user) return <AdminTrial />;
  return <>{children}</>;
}
