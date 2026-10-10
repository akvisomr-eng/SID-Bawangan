'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Post = { title: string; summary: string; body: string; category: string; published_at: string | null };

export default function InformationDetailPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [slug, setSlug] = useState('');
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('slug') ?? '';
    setSlug(value);
    if (!value || !supabase) { setLoading(false); return; }
    let active = true;
    void supabase.from('posts').select('title,summary,body,category,published_at').eq('slug', value).eq('status', 'published').maybeSingle().then(({ data }) => {
      if (active) { setPost(data as Post | null); setLoading(false); }
    });
    return () => { active = false; };
  }, [supabase]);

  const date = post?.published_at ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(post.published_at)) : '';
  return <main className="detail-shell">
    <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">B</span><span><strong>PEMERINTAH DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></Link><Link className="admin-link" href="/">Beranda ↗</Link></header>
    <Link className="back-link detail-back" href="/">← Semua informasi</Link>
    {loading ? <div className="empty-public">Memuat informasi…</div> : !post ? <section className="empty-public"><span className="empty-symbol">✳</span><h1>Informasi tidak ditemukan</h1><p>{slug ? 'Konten mungkin belum diterbitkan atau alamatnya tidak sesuai.' : 'Pilih informasi dari halaman beranda untuk membaca detailnya.'}</p><Link className="text-link" href="/">Kembali ke beranda →</Link></section> : <article className="detail-article"><p className="eyebrow">INFORMASI RESMI DESA</p><span className="content-tag">{post.category === 'news' ? 'Berita' : post.category === 'announcement' ? 'Pengumuman' : post.category === 'service' ? 'Layanan' : 'Profil desa'}</span><h1>{post.title}</h1><p className="detail-date">{date}</p>{post.summary && <p className="detail-summary">{post.summary}</p>}<div className="detail-body">{post.body.split(/\\n\\s*\\n/).map((p, i) => <p key={i}>{p}</p>)}</div><div className="detail-note">Informasi ini berasal dari portal Pemerintah Desa Bawangan. Untuk kepastian, gunakan kontak resmi pemerintah desa.</div></article>}
    <footer className="site-footer"><Link className="brand footer-brand" href="/"><span className="brand-mark">B</span><span><strong>DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></Link><p>© {new Date().getFullYear()} Pemerintah Desa Bawangan</p></footer>
  </main>;
}
