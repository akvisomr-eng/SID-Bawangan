'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Json } from '@/lib/supabase/database.types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import AdminSidebar from '@/components/admin/AdminSidebar';

type PortalModule = {
  id: string; module_key: string; title: string; category: string; summary: string;
  body: string; data: Json; status: 'draft' | 'published' | 'archived';
  display_order: number; published_at: string | null; updated_at: string;
};
const categoryLabels: Record<string, string> = {
  profil: 'Profil desa', data_desa: 'Data desa', layanan: 'Layanan warga',
  transparansi: 'Transparansi', ppid: 'PPID', dokumen: 'Dokumen publik',
  sosial: 'Jaring pengaman sosial', agenda: 'Agenda', anti_korupsi: 'Desa anti korupsi',
};
const prettyStatus: Record<string, string> = { draft: 'Draf', published: 'Terbit', archived: 'Arsip' };

export default function PortalModulesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [modules, setModules] = useState<PortalModule[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [dataText, setDataText] = useState('{}');
  const selected = modules.find((item) => item.id === selectedId) ?? null;
  const canPublish = role === 'admin' || role === 'publisher';
  const canEdit = role === 'admin' || role === 'publisher' || role === 'editor';

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/admin/login'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    setRole(profile?.role ?? '');
    const { data, error } = await supabase.from('portal_modules').select('*').order('display_order').order('title');
    if (error) setMessage('Modul belum dapat dimuat. Periksa migrasi dan kebijakan akses database.');
    else {
      const rows = (data ?? []) as PortalModule[];
      setModules(rows);
      const requestedKey = new URLSearchParams(window.location.search).get('module');
      const requestedModule = requestedKey ? rows.find((item) => item.module_key === requestedKey) : undefined;
      setSelectedId(requestedModule?.id ?? (current => current && rows.some((item) => item.id === current) ? current : rows[0]?.id ?? ''));
    }
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!selected) return;
    setTitle(selected.title);
    setSummary(selected.summary);
    setBody(selected.body);
    setDataText(JSON.stringify(selected.data ?? {}, null, 2));
  }, [selectedId, selected?.updated_at]);

  async function save(nextStatus: 'draft' | 'published') {
    if (!supabase || !selected) return;
    if (nextStatus === 'published' && !canPublish) {
      setMessage('Akun editor hanya dapat menyimpan draf. Peran publisher atau admin diperlukan untuk publikasi.');
      return;
    }
    let parsedData: Json;
    try {
      parsedData = JSON.parse(dataText) as Json;
      if (!parsedData || Array.isArray(parsedData) || typeof parsedData !== 'object') throw new Error('Data harus berupa objek JSON.');
    } catch {
      setMessage('Format Data Terstruktur tidak valid. Periksa tanda kurung dan koma JSON.');
      return;
    }
    setBusy(true); setMessage('');
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('portal_modules').update({
      title: title.trim(), summary: summary.trim(), body: body.trim(), data: parsedData,
      status: nextStatus, published_at: nextStatus === 'published' ? (selected.published_at ?? new Date().toISOString()) : null,
      updated_by: user?.id ?? null,
    }).eq('id', selected.id);
    setBusy(false);
    if (error) { setMessage(error.code === '42501' ? 'Akses ditolak oleh kebijakan database. Periksa peran akun.' : 'Simpan gagal. Periksa koneksi dan data yang dimasukkan.'); return; }
    setMessage(nextStatus === 'published' ? 'Modul berhasil dipublikasikan.' : 'Draf modul berhasil disimpan.');
    await load();
  }

  if (loading) return <main className="admin-page"><div className="admin-loading">Memuat katalog modul…</div></main>;
  if (!supabase) return <main className="admin-page"><section className="setup-notice"><h1>Supabase belum terhubung</h1><Link href="/admin">Kembali ke ruang kerja</Link></section></main>;

  return <main className="admin-page admin-page-with-sidebar">
    <AdminSidebar />
    <header className="admin-topbar"><Link className="brand" href="/admin"><span className="brand-mark">B</span><span><strong>SID BAWANGAN</strong><small>Pengelolaan modul portal</small></span></Link><div className="admin-top-actions"><span className="signed-in">Peran: {role || 'belum ditetapkan'}</span><Link className="button-quiet" href="/">Lihat website ↗</Link></div></header>
    <section className="admin-heading"><div><p className="eyebrow">KATALOG KONTEN</p><h1>Modul website desa</h1><p>Semua menu sudah memiliki kerangka data. Pilih modul, isi informasi terverifikasi dan data terstruktur, simpan sebagai draf, lalu publikasikan sesuai kewenangan.</p></div><div className="admin-stats"><div><strong>{modules.length}</strong><span>Modul disiapkan</span></div><div><strong>{modules.filter((item) => item.status === 'published').length}</strong><span>Terbit</span></div><div><strong>{modules.filter((item) => item.status === 'draft').length}</strong><span>Draf</span></div></div></section>
    {message && <div className="status-message" role="status">{message}</div>}
    <div className="workspace-grid">
      <section className="posts-panel"><div className="panel-heading"><div><p className="eyebrow">DAFTAR MODUL</p><h2>Pilih bagian website</h2></div><button className="button-quiet" onClick={() => void load()}>Muat ulang ↻</button></div>
        <div className="post-list">{modules.map((item) => <button type="button" key={item.id} onClick={() => setSelectedId(item.id)} className="post-row" style={{ width: '100%', textAlign: 'left', border: selectedId === item.id ? '2px solid var(--green, #176b4d)' : undefined, background: selectedId === item.id ? 'var(--mint, #eaf4ee)' : undefined, cursor: 'pointer' }}><div className="post-row-main"><span className={'state-dot ' + item.status}/><div><h3>{item.title}</h3><p>{categoryLabels[item.category] ?? item.category} · {item.module_key}</p></div></div><span className={'status-pill ' + item.status}>{prettyStatus[item.status]}</span></button>)}</div>
      </section>
      <section className="editor-panel"><div className="panel-heading"><div><p className="eyebrow">EDITOR MODUL</p><h2>{selected?.title ?? 'Pilih modul'}</h2></div>{selected && <span className={'status-pill ' + selected.status}>{prettyStatus[selected.status]}</span>}</div>
        {!selected ? <p>Tidak ada modul yang tersedia.</p> : <>
          <p className="login-copy">Kunci modul: <code>{selected.module_key}</code>. Kategori dan kunci dipertahankan agar menu tidak terputus.</p>
          <label htmlFor="module-title">Judul tampil</label><input id="module-title" disabled={!canEdit} value={title} maxLength={180} onChange={(event) => setTitle(event.target.value)} />
          <label htmlFor="module-summary">Ringkasan</label><textarea id="module-summary" disabled={!canEdit} rows={3} maxLength={800} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Ringkasan singkat untuk pengunjung" />
          <label htmlFor="module-body">Isi informasi</label><textarea id="module-body" disabled={!canEdit} rows={7} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Masukkan narasi resmi, prosedur, sumber, atau keterangan terverifikasi." />
          {role === 'admin' && <details className="module-advanced-settings">
            <summary>Pengaturan teknis (lanjutan)</summary>
            <p className="login-copy">Bagian ini untuk administrator teknis saat integrasi atau penyesuaian struktur data. Pengelolaan konten sehari-hari cukup menggunakan judul, ringkasan, dan isi informasi di atas.</p>
            <label htmlFor="module-data">Data terstruktur (JSON)</label><textarea id="module-data" rows={12} value={dataText} onChange={(event) => setDataText(event.target.value)} spellCheck={false} className="module-json-editor" />
            <p className="agent-disclaimer">Ubah JSON hanya bila memahami skemanya. Gunakan sumber resmi untuk angka; jangan memasukkan NIK, nomor KK, alamat pribadi, atau daftar penerima bantuan ke konten publik.</p>
          </details>}
          <div className="editor-actions"><button className="button-secondary" disabled={busy || !canEdit} onClick={() => void save('draft')}>{busy ? 'Menyimpan…' : 'Simpan draf'}</button><button className="button-primary" disabled={busy || !canPublish} title={!canPublish ? 'Perlu peran publisher atau admin' : undefined} onClick={() => void save('published')}>{busy ? 'Memproses…' : 'Publikasikan modul'}</button></div>
          {!canEdit && <small className="notice">Akun viewer hanya memiliki akses baca. Hubungi administrator jika perlu mengubah konten.</small>}
          {canEdit && !canPublish && <small className="notice">Akun editor dapat menyiapkan draf. Publikasi dilakukan oleh publisher atau admin.</small>}
        </>}
      </section>
    </div>
    <footer className="admin-footer">SID Bawangan · Semua modul baru dimulai sebagai draf dan hanya dapat dibaca publik setelah dipublikasikan.</footer>
  </main>;
}
