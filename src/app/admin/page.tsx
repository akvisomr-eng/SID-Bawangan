'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { runEditorialAgent, type EditorialCategory } from '@/lib/agents/editorial-agent';

type Post = { id: string; title: string; slug: string; summary: string; body: string; category: EditorialCategory; status: 'draft'|'published'|'archived'; created_at: string; published_at: string | null };
const categoryLabels: Record<EditorialCategory,string> = { news:'Berita', announcement:'Pengumuman', service:'Layanan', village_profile:'Profil desa' };

export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user,setUser] = useState<User|null>(null);
  const [posts,setPosts] = useState<Post[]>([]);
  const [loading,setLoading] = useState(true);
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);
  const [title,setTitle] = useState('');
  const [summary,setSummary] = useState('');
  const [body,setBody] = useState('');
  const [category,setCategory] = useState<EditorialCategory>('news');
  const [slug,setSlug] = useState('');
  const [showAgent,setShowAgent] = useState(false);
  const agent = runEditorialAgent({title,summary,body,category});

  async function refresh() {
    if (!supabase) { setLoading(false); return; }
    const {data:{user:current}} = await supabase.auth.getUser();
    setUser(current);
    if (!current) { setLoading(false); return; }
    const {data,error} = await supabase.from('posts').select('id,title,slug,summary,body,category,status,created_at,published_at').order('updated_at',{ascending:false});
    if (error) setMessage('Konten belum dapat dimuat. Periksa koneksi dan kebijakan akses Supabase.');
    else setPosts((data ?? []) as Post[]);
    setLoading(false);
  }
  useEffect(() => { void refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function signOut() { if (supabase) await supabase.auth.signOut(); router.replace('/admin/login'); }
  async function savePost(publish = false) {
    if (!supabase || !user) return;
    if (!title.trim() || !slug.trim() || !body.trim()) { setMessage('Judul, slug, dan isi wajib diisi.'); return; }
    if (publish && (agent.score < 65 || agent.findings.some(f=>f.level==='error'))) { setMessage('Agen Editorial menemukan hal yang harus diperbaiki sebelum publikasi.'); setShowAgent(true); return; }
    setBusy(true); setMessage('');
    const payload = {title:title.trim(),slug:slug.trim(),summary:summary.trim(),body:body.trim(),category,status:publish?'published':'draft',published_at:publish?new Date().toISOString():null,author_id:user.id};
    const {error} = await supabase.from('posts').insert(payload);
    setBusy(false);
    if (error) { setMessage(error.code === '42501' ? 'Akses tidak cukup untuk menyimpan konten. Hubungi administrator SID.' : error.code === '23505' ? 'Slug sudah digunakan. Ubah slug agar unik.' : 'Konten gagal disimpan. Periksa koneksi atau aturan akses.'); return; }
    setMessage(publish?'Konten dipublikasikan.':'Draf berhasil disimpan.');
    setTitle('');setSlug('');setSummary('');setBody('');setShowAgent(false);await refresh();
  }
  async function setStatus(post:Post,status:'published'|'archived') {
    if (!supabase) return;
    const {error}=await supabase.from('posts').update({status,published_at:status==='published'?(post.published_at ?? new Date().toISOString()):post.published_at}).eq('id',post.id);
    setMessage(error?'Perubahan status ditolak. Periksa peran akun Anda.':status==='published'?'Konten dipublikasikan.':'Konten diarsipkan.');
    if (!error) await refresh();
  }

  if (loading) return <main className="admin-page"><div className="admin-loading">Memuat ruang kerja…</div></main>;
  if (!supabase) return <main className="admin-page"><a href="/" className="back-link">← Website publik</a><section className="setup-notice"><span className="brand-mark">B</span><p className="eyebrow">KONFIGURASI DIPERLUKAN</p><h1>Hubungkan Supabase</h1><p>Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY pada environment deployment untuk mengaktifkan ruang kerja.</p></section></main>;
  if (!user) return <main className="admin-page"><section className="setup-notice"><span className="brand-mark">B</span><h1>Sesi admin tidak ditemukan</h1><p>Silakan masuk menggunakan akun resmi SID Bawangan.</p><a className="primary-link" href="/admin/login">Buka halaman login →</a></section></main>;

  return <main className="admin-page">
    <header className="admin-topbar"><a className="brand" href="/"><span className="brand-mark">B</span><span><strong>SID BAWANGAN</strong><small>Ruang kerja pengelola</small></span></a><div className="admin-top-actions"><span className="signed-in">{user.email}</span><button className="button-quiet" onClick={()=>void signOut()}>Keluar</button></div></header>
    <section className="admin-heading"><div><p className="eyebrow">PUSAT KENDALI</p><h1>Ruang kerja desa</h1><p>Kelola informasi sekali, tampilkan pada website publik dari basis data yang sama.</p></div><div className="admin-stats"><div><strong>{posts.length}</strong><span>Total konten</span></div><div><strong>{posts.filter(p=>p.status==='published').length}</strong><span>Terbit</span></div><div><strong>{posts.filter(p=>p.status==='draft').length}</strong><span>Draf</span></div></div></section>
    {message && <div className="status-message" role="status">{message}</div>}
    <div className="workspace-grid"><section className="editor-panel"><div className="panel-heading"><div><p className="eyebrow">EDITOR KONTEN</p><h2>Buat konten baru</h2></div><span className="draft-chip">DRAF</span></div>
      <label htmlFor="post-title">Judul konten</label><input id="post-title" value={title} onChange={e=>{setTitle(e.target.value);if(!slug||slug===runEditorialAgent({title:slug.replace(/-/g,' '),summary,body,category}).suggestedSlug)setSlug(runEditorialAgent({title:e.target.value,summary,body,category}).suggestedSlug)}} placeholder="Contoh: Jadwal pelayanan desa bulan ini"/>
      <div className="form-two"><div><label htmlFor="post-category">Kategori</label><select id="post-category" value={category} onChange={e=>setCategory(e.target.value as EditorialCategory)}>{Object.entries(categoryLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><div><label htmlFor="post-slug">Slug URL</label><input id="post-slug" value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'))} placeholder="judul-konten"/></div></div>
      <label htmlFor="post-summary">Ringkasan</label><textarea id="post-summary" rows={3} value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Ringkasan singkat yang tampil pada kartu informasi publik"/>
      <label htmlFor="post-body">Isi konten</label><textarea id="post-body" rows={8} value={body} onChange={e=>setBody(e.target.value)} placeholder="Tulis informasi resmi yang telah diverifikasi…"/>
      <div className="editor-actions"><button className="button-quiet" disabled={busy} onClick={()=>setShowAgent(!showAgent)}>✦ Periksa dengan Agen Editorial</button><div className="action-pair"><button className="button-secondary" disabled={busy} onClick={()=>void savePost(false)}>{busy?'Menyimpan…':'Simpan draf'}</button><button className="button-primary" disabled={busy} onClick={()=>void savePost(true)}>{busy?'Memproses…':'Publikasikan'}</button></div></div>
      {showAgent && <section className="agent-panel"><div className="agent-score"><span>Skor pemeriksaan</span><strong>{agent.score}<small>/100</small></strong></div><div className="agent-findings">{agent.findings.map(f=><p className={'finding '+f.level} key={f.code}><b>{f.level==='error'?'Perlu diperbaiki':f.level==='warning'?'Perhatian':'Catatan'}</b>{f.message}</p>)}</div><ul>{agent.checklist.map(item=><li key={item}>{item}</li>)}</ul><p className="agent-disclaimer">Agen berbasis aturan lokal; tidak mengirim data ke layanan AI eksternal dan tidak menggantikan verifikasi petugas.</p></section>}
    </section>
    <section className="posts-panel"><div className="panel-heading"><div><p className="eyebrow">PUBLIKASI</p><h2>Konten terbaru</h2></div><button className="button-quiet" onClick={()=>void refresh()}>Muat ulang ↻</button></div>
      {posts.length===0?<div className="empty-state"><span>✧</span><h3>Belum ada konten</h3><p>Konten yang disimpan akan muncul di sini.</p></div>:<div className="post-list">{posts.map(post=><article className="post-row" key={post.id}><div className="post-row-main"><span className={'state-dot '+post.status}/><div><h3>{post.title}</h3><p>{categoryLabels[post.category]} · /{post.slug}</p></div></div><div className="post-row-actions"><span className={'status-pill '+post.status}>{post.status==='published'?'Terbit':post.status==='draft'?'Draf':'Arsip'}</span>{post.status!=='published'&&<button className="mini-action" onClick={()=>void setStatus(post,'published')}>Terbitkan</button>}{post.status==='published'&&<button className="mini-action" onClick={()=>void setStatus(post,'archived')}>Arsipkan</button>}</div></article>)}</div>}
    </section></div>
    <footer className="admin-footer">SID Bawangan · Akses dan tindakan dibatasi oleh kebijakan database.</footer>
  </main>;
}
