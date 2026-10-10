'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Role = 'admin' | 'publisher' | 'editor' | 'viewer';
type Profile = { id: string; full_name: string; email: string | null; role: Role; created_at: string };
const roleLabels: Record<Role, string> = {
  admin: 'Administrator', publisher: 'Publisher / Penyetuju',
  editor: 'Editor Konten', viewer: 'Viewer / Pembaca',
};
const roleDescriptions: Record<Role, string> = {
  admin: 'Akses administrasi penuh, pengelolaan pengguna, dan semua konten.',
  publisher: 'Memeriksa, menerbitkan, dan mengarsipkan konten.',
  editor: 'Membuat serta memperbarui draf; tidak dapat menerbitkan.',
  viewer: 'Akses baca saja untuk meninjau konten dan modul.',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/admin/login'); return; }
    setCurrentUserId(user.id);
    const { data: ownProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (ownProfile?.role !== 'admin') { setAuthorized(false); setLoading(false); return; }
    setAuthorized(true);
    const { data, error } = await supabase.from('profiles').select('id,full_name,email,role,created_at').order('full_name');
    if (error) setMessage('Daftar pengguna tidak dapat dimuat. Periksa kebijakan akses profil.');
    else setProfiles((data ?? []) as Profile[]);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { void load(); }, [load]);

  async function changeRole(profile: Profile, role: Role) {
    if (!supabase || profile.id === currentUserId || role === profile.role) return;
    setBusyId(profile.id); setMessage('');
    const { error } = await supabase.rpc('admin_set_user_role', { target_user_id: profile.id, new_role: role });
    setBusyId('');
    if (error) {
      setMessage(error.message.includes('last administrator') ? 'Administrator terakhir tidak dapat diturunkan perannya.' : error.message.includes('42501') ? 'Perubahan ditolak oleh kebijakan keamanan.' : 'Peran gagal diperbarui. Muat ulang lalu coba kembali.');
      return;
    }
    setProfiles((items) => items.map((item) => item.id === profile.id ? { ...item, role } : item));
    setMessage('Peran untuk ' + (profile.email || profile.full_name || 'pengguna') + ' berhasil diperbarui menjadi ' + roleLabels[role] + '.');
  }

  const visibleProfiles = profiles.filter((profile) => {
    const q = filter.trim().toLowerCase();
    return !q || [profile.full_name, profile.email ?? '', roleLabels[profile.role]].some((value) => value.toLowerCase().includes(q));
  });

  if (loading) return <main className="admin-page"><div className="admin-loading">Memuat pengelolaan pengguna…</div></main>;
  if (!supabase) return <main className="admin-page"><section className="setup-notice"><h1>Supabase belum terhubung</h1><Link href="/admin">Kembali ke dashboard</Link></section></main>;
  if (!authorized) return <main className="admin-page"><section className="setup-notice"><span className="brand-mark">B</span><h1>Akses administrator diperlukan</h1><p>Hanya administrator SID Bawangan yang dapat melihat daftar pengguna dan mengubah peran.</p><Link className="primary-link" href="/admin">Kembali ke dashboard →</Link></section></main>;

  const counts = {
    admin: profiles.filter((p) => p.role === 'admin').length,
    publisher: profiles.filter((p) => p.role === 'publisher').length,
    editor: profiles.filter((p) => p.role === 'editor').length,
    viewer: profiles.filter((p) => p.role === 'viewer').length,
  };

  return <main className="admin-page admin-page-with-sidebar">
    <AdminSidebar />
    <header className="admin-topbar"><Link className="brand" href="/admin"><span className="brand-mark">B</span><span><strong>SID BAWANGAN</strong><small>Administrasi pengguna</small></span></Link><div className="admin-top-actions"><span className="signed-in">Administrator</span><Link className="button-quiet" href="/">Lihat website ↗</Link></div></header>
    <section className="admin-heading"><div><p className="eyebrow">KEAMANAN & AKSES</p><h1>Pengguna dan level akses</h1><p>Atur kewenangan akun berdasarkan tugas. Perubahan peran diproses oleh fungsi database yang memverifikasi hak administrator.</p></div><div className="admin-stats"><div><strong>{profiles.length}</strong><span>Total pengguna</span></div><div><strong>{counts.admin}</strong><span>Administrator</span></div><div><strong>{counts.publisher}</strong><span>Publisher</span></div></div></section>
    {message && <div className="status-message" role="status">{message}</div>}
    <section className="sid-role-guide">
      {(Object.keys(roleLabels) as Role[]).map((role) => <article key={role} className="sid-role-card"><span className={'sid-role-chip sid-role-' + role}>{roleLabels[role]}</span><p>{roleDescriptions[role]}</p><strong>{counts[role]} akun</strong></article>)}
    </section>
    <section className="posts-panel sid-user-panel">
      <div className="panel-heading"><div><p className="eyebrow">DIREKTORI AKUN</p><h2>Daftar pengguna</h2></div><button className="button-quiet" onClick={() => { setLoading(true); void load(); }}>Muat ulang ↻</button></div>
      <div className="sid-user-toolbar"><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Cari nama, email, atau level…" aria-label="Cari pengguna" /><span>{visibleProfiles.length} pengguna</span></div>
      <div className="sid-user-list">
        {visibleProfiles.map((profile) => <article key={profile.id} className="sid-user-row">
          <span className="sid-user-avatar" aria-hidden="true">{(profile.full_name || profile.email || '?').trim().charAt(0).toUpperCase()}</span>
          <div className="sid-user-ident"><strong>{profile.full_name || 'Nama belum diisi'}</strong><span>{profile.email || 'Email belum tersinkron'}</span><small>Terdaftar {new Date(profile.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</small></div>
          <div className="sid-user-role-control"><label htmlFor={'role-' + profile.id}>Level akses</label><select id={'role-' + profile.id} value={profile.role} disabled={busyId === profile.id || profile.id === currentUserId} onChange={(event) => void changeRole(profile, event.target.value as Role)}>{(Object.keys(roleLabels) as Role[]).map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select>{profile.id === currentUserId && <small>Anda tidak dapat mengubah peran sendiri.</small>}</div>
        </article>)}
        {visibleProfiles.length === 0 && <p className="sid-user-empty">Tidak ada pengguna yang cocok dengan pencarian.</p>}
      </div>
      <p className="sid-user-footnote">Akun baru tetap dibuat melalui Supabase Auth. Setelah akun dibuat, profilnya akan muncul di sini dan perannya dapat ditetapkan. Pendaftaran publik tidak diaktifkan.</p>
    </section>
  </main>;
}
