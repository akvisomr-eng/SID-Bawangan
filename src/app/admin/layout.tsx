'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import AdminTrial from '@/components/admin/AdminTrial';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) { setAuthChecked(true); return; }
    if (!supabase) { setUser(null); setAuthChecked(true); return; }
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) { setUser(data.user); setAuthChecked(true); }
    }).catch(() => { if (active) { setUser(null); setAuthChecked(true); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) { setUser(session?.user ?? null); setAuthChecked(true); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [isLogin, supabase]);

  if (isLogin) return <>{children}</>;
  if (!authChecked) return <main className="sid-trial-loading">Menyiapkan ruang kerja SID Bawangan…</main>;
  if (!user) return <AdminTrial />;
  return <>{children}</>;
}
