'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type PublicPost = { id: string; title: string; slug: string; summary: string; category: 'news' | 'announcement' | 'service' | 'village_profile'; published_at: string | null };
const labels = { news: 'Berita desa', announcement: 'Pengumuman', service: 'Layanan', village_profile: 'Profil desa' };
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : 'Informasi desa';

const services = [
  { icon: '▤', title: 'Informasi & pengumuman', text: 'Pemberitahuan resmi dan informasi penting desa.', state: 'Tersedia', href: '#informasi' },
  { icon: '⌂', title: 'Profil desa', text: 'Mengenal wilayah dan pemerintahan Desa Bawangan.', state: 'Lihat profil', href: '#profil' },
  { icon: '✉', title: 'Layanan administrasi', text: 'Informasi awal mengenai kebutuhan administrasi warga.', state: 'Informasi', href: '#layanan' },
  { icon: '◉', title: 'Aspirasi warga', text: 'Ruang partisipasi masyarakat akan dikembangkan bertahap.', state: 'Dalam pengembangan', href: '#layanan' },
  { icon: '▦', title: 'Dokumen publik', text: 'Akses dokumen resmi setelah tersedia dan diverifikasi.', state: 'Dalam pengembangan', href: '#dokumen' },
  { icon: '↗', title: 'Transparansi desa', text: 'Informasi anggaran ditampilkan setelah data resmi disahkan.', state: 'Menunggu data resmi', href: '#transparansi' },
];

export default function HomePage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    if (!supabase) { setLoaded(true); return; }
    void supabase.from('posts').select('id,title,slug,summary,category,published_at').eq('status', 'published').order('published_at', { ascending: false }).limit(7).then(({ data }) => {
      if (active) { setPosts((data ?? []) as PublicPost[]); setLoaded(true); }
    });
    return () => { active = false; };
  }, [supabase]);

  const featured = posts[0];
  return <main className="page-shell">
    <div className="village-notice"><span className="notice-pulse" /> <strong>PORTAL RESMI DESA BAWANGAN</strong><span className="notice-divider">/</span> Informasi publik untuk warga, dari satu pintu.</div>
    <header className="topbar">
      <Link className="brand" href="/" aria-label="SID Bawangan beranda"><span className="brand-mark">B</span><span><strong>PEMERINTAH DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></Link>
      <nav className="top-nav" aria-label="Navigasi utama"><a href="#layanan">Layanan</a><a href="#informasi">Berita</a><a href="#transparansi">Transparansi</a><Link className="admin-link" href="/admin/login">Panel Admin <span>↗</span></Link></nav>
    </header>

    <section className="hero village-hero">
      <div className="hero-content">
        <p className="eyebrow"><span className="live-dot" /> MELAYANI · TERBUKA · TERHUBUNG</p>
        <h1>Informasi desa,<br /><span>lebih dekat dengan warga.</span></h1>
        <p className="hero-copy">Selamat datang di portal digital Pemerintah Desa Bawangan. Temukan berita, pengumuman, dan informasi pelayanan dalam satu tempat yang mudah diakses.</p>
        <div className="hero-actions"><a className="primary-link" href="#layanan">Jelajahi layanan <span aria-hidden="true">↗</span></a><a className="hero-secondary" href="#informasi">Berita terbaru ↓</a></div>
        <div className="hero-trust"><span>01 <b>Informasi resmi</b></span><span>02 <b>Akses mudah</b></span><span>03 <b>Data terkelola</b></span></div>
      </div>
      <div className="hero-art" aria-label="Ilustrasi lanskap desa">
        <div className="sun-disc" /><div className="cloud cloud-one" /><div className="cloud cloud-two" />
        <div className="hill hill-back" /><div className="hill hill-front" /><div className="rice-field" />
        <div className="village-line"><span /><span /><span /><span /><span /></div>
        <div className="art-label"><span className="art-label-icon">⌂</span><span><b>Desa Bawangan</b><small>Ploso · Jombang · Jawa Timur</small></span></div>
        <span className="hero-art-note">KABAR DESA · LAYANAN PUBLIK</span>
      </div>
      <div className="hero-bottomline"><span>WEBSITE RESMI PEMERINTAH DESA BAWANGAN</span><span>INFORMASI UNTUK SEMUA</span></div>
    </section>

    <section id="layanan" className="services-section">
      <div className="section-heading"><div><p className="eyebrow">AKSES CEPAT</p><h2>Ada yang bisa kami bantu?</h2><p className="section-copy">Mulai dari informasi desa hingga akses layanan publik.</p></div><span className="section-index">01 / LAYANAN</span></div>
      <div className="services-grid">{services.map((service, index) => <a className="service-card" href={service.href} key={service.title}><span className="service-icon">{service.icon}</span><span className="service-number">0{index + 1}</span><h3>{service.title}</h3><p>{service.text}</p><span className="service-bottom"><small>{service.state}</small><b aria-hidden="true">↗</b></span></a>)}</div>
    </section>

    <section id="informasi" className="content-section village-news">
      <div className="section-heading"><div><p className="eyebrow">KABAR BAWANGAN</p><h2>Berita dan informasi desa.</h2><p className="section-copy">Informasi yang dipublikasikan oleh pengelola desa melalui sistem informasi resmi.</p></div><span className="section-index">02 / BERITA</span></div>
      {featured && <article className="featured-post"><div className="featured-art"><span className="featured-art-mark">B.</span><span className="featured-art-caption">BAWANGAN<br />DALAM KABAR</span><span className="featured-art-stamp">INFORMASI<br />RESMI DESA</span></div><div className="featured-copy"><span className="content-tag">{labels[featured.category]}</span><p className="post-date">{formatDate(featured.published_at)}</p><h3>{featured.title}</h3><p>{featured.summary || 'Baca informasi lengkap yang diterbitkan oleh Pemerintah Desa Bawangan.'}</p><Link href={`/informasi?slug=${encodeURIComponent(featured.slug)}`} className="text-link">Baca selengkapnya <span>→</span></Link></div></article>}
      <div className="post-grid">{posts.slice(featured ? 1 : 0).map(post => <article className="post-card" key={post.id}><div className="post-card-top"><span className="content-tag">{labels[post.category]}</span><span className="post-date">{formatDate(post.published_at)}</span></div><h3>{post.title}</h3><p>{post.summary || 'Informasi resmi dari Pemerintah Desa Bawangan.'}</p><Link className="text-link" href={`/informasi?slug=${encodeURIComponent(post.slug)}`}>Selengkapnya <span>→</span></Link></article>)}</div>
      {loaded && posts.length === 0 && <div className="empty-public"><span className="empty-symbol">✳</span><h3>Informasi terbaru sedang disiapkan.</h3><p>Belum ada berita yang dipublikasikan. Informasi akan muncul di sini setelah diperiksa dan diterbitkan oleh pengelola desa.</p></div>}
      {!loaded && <div className="loading-line">Memuat informasi terbaru…</div>}
    </section>

    <section id="profil" className="profile-band village-profile"><div><p className="eyebrow">MENGENAL BAWANGAN</p><h2>Desa yang berkembang<br />bersama warganya.</h2></div><p>Portal ini menjadi titik awal akses informasi publik Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang. Informasi profil, potensi, dan kegiatan akan dilengkapi berdasarkan data resmi pemerintah desa.</p><a href="#dokumen" className="profile-arrow" aria-label="Lihat dokumen desa">↘</a></section>

    <section id="dokumen" className="documents-section"><div className="section-heading"><div><p className="eyebrow">PUSAT INFORMASI</p><h2>Dokumen dan data desa.</h2><p className="section-copy">Dokumen publik akan ditambahkan setelah diterima dan diverifikasi.</p></div><span className="section-index">03 / DOKUMEN</span></div><div className="document-placeholder"><span className="document-icon">▤</span><div><h3>Ruang dokumen publik</h3><p>Belum ada dokumen yang ditampilkan. Bagian ini disiapkan untuk peraturan desa, dokumen perencanaan, laporan pembangunan, dan dokumen publik lainnya.</p></div><span className="document-status">MENUNGGU DATA RESMI</span></div></section>

    <section id="transparansi" className="transparency-section"><div><p className="eyebrow">AKUNTABILITAS PUBLIK</p><h2>Transparansi dimulai dari data yang benar.</h2><p>Informasi anggaran dan pembangunan akan ditampilkan setelah dokumen resmi tersedia. Kami tidak menampilkan angka perkiraan sebagai data pemerintah desa.</p></div><div className="transparency-status"><span className="status-symbol">↗</span><b>Ruang transparansi desa</b><small>Menunggu data resmi terverifikasi</small></div></section>

    <footer className="site-footer"><Link className="brand footer-brand" href="/"><span className="brand-mark">B</span><span><strong>DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></Link><p>© {new Date().getFullYear()} Pemerintah Desa Bawangan.<br />Portal informasi publik.</p><span className="footer-status"><i /> Portal informasi</span></footer>
  </main>;
}
