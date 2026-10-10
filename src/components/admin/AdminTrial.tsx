'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

const TRIAL_KEY = 'sid-bawangan-demo-trial-start-v1';
const TRIAL_MS = 14 * 24 * 60 * 60 * 1000;
type DemoPost = { id: number; title: string; category: string; status: 'Terbit' | 'Draf'; date: string };
const initialPosts: DemoPost[] = [
  { id: 1, title: 'Kerja Bakti Lingkungan Desa', category: 'Pengumuman', status: 'Terbit', date: 'Contoh · 8 Okt 2026' },
  { id: 2, title: 'Informasi Jam Pelayanan Kantor Desa', category: 'Layanan', status: 'Terbit', date: 'Contoh · 5 Okt 2026' },
  { id: 3, title: 'Rencana Kegiatan Pembangunan', category: 'Berita', status: 'Draf', date: 'Contoh · 3 Okt 2026' },
];
const modules = [
  ['Profil Desa', 'profil-desa'], ['Pemerintahan Desa', 'struktur-pemerintahan'], ['Statistik Desa', 'statistik-penduduk'],
  ['Standar Pelayanan', 'standar-pelayanan'], ['PPID & Informasi Publik', 'ppid-informasi-publik'], ['Dokumen Publik', 'dokumen-publik'],
  ['Produk Hukum', 'produk-hukum'], ['APBDes & Realisasi', 'apbdes-realisasi'], ['Agenda & Pengumuman', 'agenda-pengumuman'],
  ['Aspirasi & Pengaduan', 'aspirasi-pengaduan'], ['Pasar UMKM', 'pasar-umkm'], ['Laporan Pembangunan', 'laporan-pembangunan'],
];

export default function AdminTrial() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [tab, setTab] = useState('dashboard');
  const [posts, setPosts] = useState<DemoPost[]>(initialPosts);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Berita');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [enabledModules, setEnabledModules] = useState<string[]>(modules.map((m) => m[1]));
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    let start = Number(window.localStorage.getItem(TRIAL_KEY));
    if (!Number.isFinite(start) || start <= 0) {
      start = Date.now();
      window.localStorage.setItem(TRIAL_KEY, String(start));
    }
    setStartedAt(start);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const remainingMs = startedAt === null ? TRIAL_MS : Math.max(0, TRIAL_MS - (now - startedAt));
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  const expiresAt = useMemo(() => startedAt === null ? null : new Date(startedAt + TRIAL_MS), [startedAt]);
  const isExpired = startedAt !== null && remainingMs <= 0;
  const visiblePosts = posts.filter((post) => [post.title, post.category, post.status].some((value) => value.toLowerCase().includes(search.toLowerCase())));

  const addDemoPost = useCallback((publish: boolean) => {
    if (!title.trim()) { setMessage('Masukkan judul konten contoh terlebih dahulu.'); return; }
    setPosts((items) => [{ id: Date.now(), title: title.trim(), category, status: publish ? 'Terbit' : 'Draf', date: 'Contoh · baru saja' }, ...items]);
    setTitle('');
    setMessage(publish ? 'Konten contoh dipublikasikan pada simulasi saja.' : 'Draf contoh tersimpan pada simulasi saja.');
    setShowComposer(false);
  }, [title, category]);

  function toggleModule(key: string) {
    setEnabledModules((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
    setMessage('Status modul contoh diperbarui pada simulasi saja.');
  }

  if (startedAt === null) return <main className="sid-trial-loading">Menyiapkan ruang demo SID Bawangan…</main>;

  if (isExpired) return <main className="sid-trial-expired">
    <div className="sid-trial-expired-card"><span className="sid-trial-mark">B</span><p className="sid-trial-eyebrow">MASA UJI COBA SELESAI</p><h1>Terima kasih telah mencoba SID Bawangan.</h1><p>Masa trial 14 hari pada browser ini telah berakhir. Data selama demo hanya disimpan sementara di halaman ini dan tidak pernah dikirim ke basis data desa.</p><Link href="/admin/login" className="sid-trial-primary">Masuk ke panel resmi →</Link><Link href="/" className="sid-trial-back">Kembali ke website publik</Link></div>
  </main>;

  return <main className="sid-trial-app">
    <aside className="sid-trial-sidebar">
      <Link href="/" className="sid-trial-brand"><span className="sid-trial-mark">B</span><span><strong>BAWANGAN</strong><small>SID · Panel Demo</small></span></Link>
      <div className="sid-trial-nav-label">RUANG KERJA</div>
      <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}><span>▦</span> Dashboard</button>
      <button className={tab === 'konten' ? 'active' : ''} onClick={() => setTab('konten')}><span>▤</span> Berita & Pengumuman</button>
      <button className={tab === 'modul' ? 'active' : ''} onClick={() => setTab('modul')}><span>▧</span> Modul Website</button>
      <button className={tab === 'pengguna' ? 'active' : ''} onClick={() => setTab('pengguna')}><span>♙</span> Pengguna & Akses</button>
      <div className="sid-trial-sidebar-bottom"><span className="sid-trial-dot" /><span><strong>Mode demo aktif</strong><small>Basis data resmi tidak terhubung</small></span></div>
    </aside>
    <section className="sid-trial-main">
      <header className="sid-trial-topbar"><div><p className="sid-trial-eyebrow">SISTEM INFORMASI DESA</p><strong>SID BAWANGAN</strong></div><div className="sid-trial-top-right"><span className="sid-trial-badge">DEMO · TANPA LOGIN</span><Link href="/" className="sid-trial-public-link">Website publik ↗</Link></div></header>
      <div className="sid-trial-banner"><span className="sid-trial-banner-icon">◷</span><div><strong>Trial 14 hari · Mode demo aman</strong><p>{remainingDays} hari tersisa{expiresAt ? ' · Berakhir ' + expiresAt.toLocaleDateString('id-ID', {day:'2-digit',month:'long',year:'numeric'}) : ''}. Semua perubahan hanya contoh lokal dan tidak menyentuh data resmi.</p></div><span className="sid-trial-count">{remainingDays}<small>HARI</small></span></div>
      {message && <div className="sid-trial-message" role="status">{message}<button onClick={() => setMessage('')} aria-label="Tutup pesan">×</button></div>}
      {tab === 'dashboard' && <>
        <div className="sid-trial-heading"><div><p className="sid-trial-eyebrow">PUSAT KENDALI · DEMO</p><h1>Ruang kerja desa</h1><p>Kelola konten dan tinjau modul portal dalam simulasi.</p></div><button className="sid-trial-primary-button" onClick={() => {setTab('konten');setShowComposer(true);}}>＋ Buat konten contoh</button></div>
        <div className="sid-trial-stats"><article><span>Total konten contoh</span><strong>{posts.length}</strong><small>Data simulasi</small></article><article><span>Terbit (simulasi)</span><strong>{posts.filter(p=>p.status==='Terbit').length}</strong><small>Tidak tampil di website publik</small></article><article><span>Draf contoh</span><strong>{posts.filter(p=>p.status==='Draf').length}</strong><small>Disimpan sementara</small></article><article><span>Modul tersedia</span><strong>{modules.length}</strong><small>Katalog demo</small></article></div>
        <section className="sid-trial-panel"><div className="sid-trial-panel-heading"><div><p className="sid-trial-eyebrow">KONTEN TERBARU</p><h2>Berita & pengumuman contoh</h2></div><button className="sid-trial-text-button" onClick={() => setTab('konten')}>Lihat semua →</button></div><div className="sid-trial-posts">{posts.slice(0,4).map(post=><article key={post.id}><span className="sid-trial-post-icon">▤</span><div><strong>{post.title}</strong><small>{post.category} · {post.date}</small></div><span className={post.status==='Terbit'?'sid-trial-status published':'sid-trial-status'}>{post.status}</span></article>)}</div></section>
        <section className="sid-trial-panel"><div className="sid-trial-panel-heading"><div><p className="sid-trial-eyebrow">KATALOG PORTAL</p><h2>Modul administrasi</h2></div><button className="sid-trial-text-button" onClick={() => setTab('modul')}>Kelola modul →</button></div><div className="sid-trial-module-grid">{modules.slice(0,6).map(([label,key])=><button key={key} onClick={()=>{setTab('modul');setSearch(label);}}><span>▧</span><strong>{label}</strong><small>Contoh · tersedia</small></button>)}</div></section>
      </>}
      {tab === 'konten' && <><div className="sid-trial-heading"><div><p className="sid-trial-eyebrow">EDITOR KONTEN · SIMULASI</p><h1>Berita & pengumuman</h1><p>Buat dan publikasikan konten contoh tanpa mengubah website publik.</p></div><button className="sid-trial-primary-button" onClick={() => setShowComposer((v)=>!v)}>＋ Buat konten</button></div>
        {showComposer && <section className="sid-trial-panel sid-trial-composer"><h2>Konten contoh baru</h2><label>Judul konten<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Contoh: Jadwal pelayanan desa"/></label><label>Kategori<select value={category} onChange={e=>setCategory(e.target.value)}><option>Berita</option><option>Pengumuman</option><option>Layanan</option><option>Profil desa</option></select></label><div className="sid-trial-form-actions"><button onClick={()=>addDemoPost(false)}>Simpan draf contoh</button><button onClick={()=>addDemoPost(true)}>Publikasikan simulasi</button></div><small>Konten ini hanya disimpan dalam memori halaman demo.</small></section>}
        <section className="sid-trial-panel"><div className="sid-trial-toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari konten contoh…" /><span>{visiblePosts.length} item</span></div><div className="sid-trial-posts">{visiblePosts.map(post=><article key={post.id}><span className="sid-trial-post-icon">▤</span><div><strong>{post.title}</strong><small>{post.category} · {post.date}</small></div><span className={post.status==='Terbit'?'sid-trial-status published':'sid-trial-status'}>{post.status}</span><button className="sid-trial-delete" onClick={()=>{setPosts(items=>items.filter(item=>item.id!==post.id));setMessage('Konten contoh dihapus dari simulasi.')}}>Hapus</button></article>)}{visiblePosts.length===0&&<p className="sid-trial-empty">Belum ada konten contoh yang cocok.</p>}</div></section>
      </>}
      {tab === 'modul' && <><div className="sid-trial-heading"><div><p className="sid-trial-eyebrow">KONFIGURASI PORTAL · SIMULASI</p><h1>Modul website</h1><p>Aktif/nonaktifkan modul pada simulasi. Tidak mengubah konfigurasi produksi.</p></div></div><section className="sid-trial-panel"><div className="sid-trial-toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari modul…" /><span>{enabledModules.length} aktif dari {modules.length}</span></div><div className="sid-trial-module-list">{modules.filter(([label,key])=>(label+' '+key).toLowerCase().includes(search.toLowerCase())).map(([label,key])=><article key={key}><div><strong>{label}</strong><small>{key}</small></div><button className={enabledModules.includes(key)?'sid-trial-toggle on':'sid-trial-toggle'} onClick={()=>toggleModule(key)}>{enabledModules.includes(key)?'Aktif':'Nonaktif'}</button></article>)}</div></section></>}
      {tab === 'pengguna' && <><div className="sid-trial-heading"><div><p className="sid-trial-eyebrow">AKSES & KEAMANAN · CONTOH</p><h1>Pengguna & level akses</h1><p>Contoh pembagian peran untuk demonstrasi. Tidak ada akun nyata yang dibaca atau diubah.</p></div></div><section className="sid-trial-panel"><div className="sid-trial-role-grid"><article><span>Administrator</span><strong>1 contoh</strong><p>Pengaturan sistem dan akses pengguna.</p></article><article><span>Publisher</span><strong>2 contoh</strong><p>Memeriksa dan menerbitkan konten.</p></article><article><span>Editor</span><strong>3 contoh</strong><p>Membuat dan mengedit draf.</p></article><article><span>Viewer</span><strong>4 contoh</strong><p>Meninjau konten dalam mode baca.</p></article></div><p className="sid-trial-safe-note">Nama, email, dan akun nyata tidak dimuat pada mode demo ini.</p></section></>}
      <footer className="sid-trial-footer"><span>SID Bawangan · AKVISIO</span><span>Mode demo terisolasi · Tidak terhubung ke data produksi</span></footer>
    </section>
  </main>;
}
