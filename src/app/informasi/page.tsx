'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Post = { title: string; summary: string; body: string; category: string; published_at: string | null };

type LocalNews = { title: string; summary: string; body: string; category: string; published_at: string | null };
const localNews: Record<string, LocalNews> = {
  'juara-3-lomba-gerak-jalan': {
    title: 'Semangat dan Kekompakan Desa Bawangan Berbuah Juara 3 Lomba Gerak Jalan Tingkat Kecamatan',
    summary: 'Kabar mengenai partisipasi Desa Bawangan dalam lomba gerak jalan tingkat kecamatan.',
    body: 'Berita ini dicatat sebagai informasi kegiatan dan pencapaian Desa Bawangan. Rincian tanggal pelaksanaan, peserta, dan keterangan resmi lainnya perlu dilengkapi dari naskah berita yang telah diverifikasi oleh pengelola desa.',
    category: 'news',
    published_at: null,
  },
  'pemetaan-kebutuhan-desa-convex': {
    title: 'KPM 01 UNIPDU Petakan Kebutuhan Desa dan Pasang Tujuh Convex',
    summary: 'Kabar kegiatan KPM 01 UNIPDU terkait pemetaan kebutuhan desa dan pemasangan tujuh convex di Desa Bawangan.',
    body: 'Berita ini merangkum kegiatan pemetaan kebutuhan desa dan pemasangan tujuh convex yang dikaitkan dengan KPM 01 UNIPDU. Rincian waktu, lokasi pemasangan, tujuan, dan keterangan pelaksana perlu diisi dari naskah berita sumber yang telah diverifikasi sebelum dipublikasikan sebagai laporan lengkap.',
    category: 'news',
    published_at: null,
  },
  'desa-bawangan-berseri': {
    title: 'Dukung SDGs, KPM 01 UNIPDU Gandeng DLH Kabupaten hingga Provinsi Dorong Desa Bawangan Jadi Desa Berseri',
    summary: 'Kabar kolaborasi KPM 01 UNIPDU dan DLH untuk mendorong upaya lingkungan di Desa Bawangan.',
    body: 'Berita ini mencatat inisiatif kolaborasi KPM 01 UNIPDU dan Dinas Lingkungan Hidup untuk mendorong Desa Bawangan menjadi desa yang berorientasi pada kelestarian lingkungan. Rincian program, pihak yang terlibat, dan capaian kegiatan perlu dilengkapi berdasarkan naskah berita yang telah diverifikasi.',
    category: 'news',
    published_at: null,
  },
};

export default function InformationDetailPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [slug, setSlug] = useState('');
  const [post, setPost] = useState<Post | null>(null);
  const [localPost, setLocalPost] = useState<LocalNews | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('slug') ?? '';
    setSlug(value);
    const bundledNews = localNews[value];
    if (bundledNews) {
      setLocalPost(bundledNews);
      setLoading(false);
      return;
    }
    if (!value || !supabase) { setLoading(false); return; }
    let active = true;
    void supabase.from('posts').select('title,summary,body,category,published_at').eq('slug', value).eq('status', 'published').maybeSingle().then(({ data }) => {
      if (active) { setPost(data as Post | null); setLoading(false); }
    });
    return () => { active = false; };
  }, [supabase]);

  const currentPost = post ?? localPost;
  const date = currentPost?.published_at ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(currentPost.published_at)) : '';
  return <main className="detail-shell">
    <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">B</span><span><strong>PEMERINTAH DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></Link><Link className="admin-link" href="/">Beranda ↗</Link></header>
    <Link className="back-link detail-back" href="/">← Semua informasi</Link>
    {loading ? <div className="empty-public">Memuat informasi…</div> : !currentPost ? <section className="empty-public"><span className="empty-symbol">✳</span><h1>Informasi tidak ditemukan</h1><p>{slug ? 'Konten mungkin belum diterbitkan atau alamatnya tidak sesuai.' : 'Pilih informasi dari halaman beranda untuk membaca detailnya.'}</p><Link className="text-link" href="/">Kembali ke beranda →</Link></section> : <article className="detail-article"><p className="eyebrow">INFORMASI DESA BAWANGAN</p><span className="content-tag">{currentPost.category === 'news' ? 'Berita Desa' : currentPost.category === 'announcement' ? 'Pengumuman' : currentPost.category === 'service' ? 'Layanan' : 'Profil desa'}</span><h1>{currentPost.title}</h1><p className="detail-date">{date || 'Tanggal publikasi belum dikonfirmasi'}</p>{currentPost.summary && <p className="detail-summary">{currentPost.summary}</p>}<div className="detail-body">{currentPost.body.split(/\\n\\s*\\n/).map((p, i) => <p key={i}>{p}</p>)}</div><div className="detail-note">Berita ini disajikan di portal Bawangan Maju Bersama. Rincian yang belum diverifikasi tidak ditampilkan sebagai fakta resmi.</div></article>}
    <footer className="site-footer"><Link className="brand footer-brand" href="/"><span className="brand-mark">B</span><span><strong>DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></Link><p>© {new Date().getFullYear()} Pemerintah Desa Bawangan</p></footer>
  </main>;
}
