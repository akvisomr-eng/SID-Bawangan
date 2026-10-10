'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type PublicPost = { id: string; title: string; slug: string; summary: string; category: 'news' | 'announcement' | 'service' | 'village_profile'; published_at: string | null };
const labels = { news: 'Berita desa', announcement: 'Pengumuman', service: 'Layanan', village_profile: 'Profil desa' };
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : 'Informasi desa';
const services = [
  { icon: 'fa-bullhorn', title: 'Berita & Pengumuman', text: 'Informasi terbaru dan pemberitahuan resmi untuk masyarakat.', href: '#berita' },
  { icon: 'fa-landmark', title: 'Profil Desa', text: 'Kenali Desa Bawangan, wilayah, dan kehidupan masyarakatnya.', href: '#profil' },
  { icon: 'fa-file-lines', title: 'Layanan Administrasi', text: 'Panduan awal untuk kebutuhan pelayanan administrasi warga.', href: '#layanan' },
  { icon: 'fa-folder-open', title: 'Dokumen Publik', text: 'Ruang akses dokumen publik yang telah diterima dan diverifikasi.', href: '#dokumen' },
  { icon: 'fa-chart-column', title: 'Transparansi', text: 'Informasi publik dan pembangunan berdasarkan dokumen resmi.', href: '#transparansi' },
  { icon: 'fa-comments', title: 'Aspirasi Warga', text: 'Ruang partisipasi warga yang akan dikembangkan bertahap.', href: '#partisipasi' },
];

export default function HomePage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    if (!supabase) { setLoaded(true); return; }
    void supabase.from('posts').select('id,title,slug,summary,category,published_at').eq('status', 'published').order('published_at', { ascending: false }).limit(7).then(({ data }) => {
      if (active) { setPosts((data ?? []) as PublicPost[]); setLoaded(true); }
    });
    return () => { active = false; };
  }, [supabase]);

  const featured = posts[0];
  return <main className="agency-site" id="top">
    <nav className="agency-nav" aria-label="Navigasi utama">
      <div className="agency-container agency-nav-inner">
        <a className="agency-brand" href="#top" aria-label="SID Bawangan beranda"><span className="agency-brand-symbol">B</span><span>DESA BAWANGAN</span></a>
        <button className="agency-menu-toggle" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>MENU <i className="fa-solid fa-bars" /></button>
        <div className={`agency-nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#layanan" onClick={() => setMenuOpen(false)}>LAYANAN</a><a href="#berita" onClick={() => setMenuOpen(false)}>BERITA</a><a href="#profil" onClick={() => setMenuOpen(false)}>PROFIL</a><a href="#dokumen" onClick={() => setMenuOpen(false)}>DOKUMEN</a><Link href="/admin/login" className="agency-admin-link">PANEL ADMIN <i className="fa-solid fa-arrow-up-right-from-square" /></Link>
        </div>
      </div>
    </nav>

    <header className="agency-masthead">
      <div className="agency-container agency-masthead-content">
        <p className="agency-kicker">WEBSITE RESMI PEMERINTAH DESA</p>
        <h1>Selamat Datang<br />di Desa Bawangan</h1>
        <p className="agency-subtitle">Informasi publik, pelayanan, dan kabar desa dalam satu ruang digital yang mudah diakses oleh semua warga.</p>
        <a className="agency-button" href="#layanan">JELAJAHI LAYANAN <i className="fa-solid fa-arrow-right" /></a>
      </div>
      <div className="agency-masthead-caption">KECAMATAN PLOSO <span>•</span> KABUPATEN JOMBANG <span>•</span> JAWA TIMUR</div>
    </header>

    <section className="agency-section" id="layanan">
      <div className="agency-container">
        <div className="agency-section-heading"><h2>Layanan Desa</h2><p>Akses cepat menuju informasi dan layanan publik Desa Bawangan.</p></div>
        <div className="agency-services-grid">{services.map(service => <a className="agency-service" href={service.href} key={service.title}><span className="agency-service-icon"><i className={`fa-solid ${service.icon}`} /></span><h3>{service.title}</h3><p>{service.text}</p><span className="agency-service-arrow">Selengkapnya <i className="fa-solid fa-arrow-right" /></span></a>)}</div>
      </div>
    </section>

    <section className="agency-section agency-section-muted" id="berita">
      <div className="agency-container">
        <div className="agency-section-heading"><h2>Berita & Informasi</h2><p>Kabar dan informasi yang diterbitkan melalui sistem informasi desa.</p></div>
        {featured && <article className="agency-featured-news"><div className="agency-featured-visual"><span className="agency-visual-overline">KABAR BAWANGAN</span><span className="agency-visual-letter">B.</span><span className="agency-visual-caption">INFORMASI RESMI DESA</span></div><div className="agency-featured-copy"><span className="agency-tag">{labels[featured.category]}</span><p className="agency-date">{formatDate(featured.published_at)}</p><h3>{featured.title}</h3><p>{featured.summary || 'Baca informasi lengkap yang diterbitkan oleh Pemerintah Desa Bawangan.'}</p><Link className="agency-text-link" href={`/informasi?slug=${encodeURIComponent(featured.slug)}`}>BACA SELENGKAPNYA <i className="fa-solid fa-arrow-right" /></Link></div></article>}
        <div className="agency-news-grid">{posts.slice(featured ? 1 : 0).map(post => <article className="agency-news-card" key={post.id}><span className="agency-tag">{labels[post.category]}</span><p className="agency-date">{formatDate(post.published_at)}</p><h3>{post.title}</h3><p>{post.summary || 'Informasi resmi dari Pemerintah Desa Bawangan.'}</p><Link className="agency-text-link" href={`/informasi?slug=${encodeURIComponent(post.slug)}`}>BACA <i className="fa-solid fa-arrow-right" /></Link></article>)}</div>
        {loaded && posts.length === 0 && <div className="agency-empty"><i className="fa-regular fa-newspaper" /><h3>Informasi terbaru sedang disiapkan</h3><p>Belum ada berita yang dipublikasikan. Informasi akan muncul di sini setelah diperiksa dan diterbitkan oleh pengelola desa.</p></div>}
        {!loaded && <p className="agency-loading">Memuat informasi terbaru…</p>}
      </div>
    </section>

    <section className="agency-section agency-about" id="profil">
      <div className="agency-container agency-about-grid"><div><p className="agency-kicker agency-kicker-green">MENGENAL DESA</p><h2>Bersama membangun<br />Desa Bawangan.</h2></div><div><p>Portal ini menjadi titik awal akses informasi publik Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang. Profil, potensi, kegiatan, dan informasi wilayah akan dilengkapi berdasarkan data resmi pemerintah desa.</p><a className="agency-text-link" href="#dokumen">JELAJAHI INFORMASI <i className="fa-solid fa-arrow-right" /></a></div></div>
      <div className="agency-container agency-timeline"><div className="agency-timeline-item"><span><i className="fa-solid fa-bullhorn" /></span><h3>Informasi Terbuka</h3><p>Berita dan pengumuman desa dalam satu portal.</p></div><div className="agency-timeline-item"><span><i className="fa-solid fa-people-group" /></span><h3>Warga Terhubung</h3><p>Informasi yang mudah dijangkau dari berbagai perangkat.</p></div><div className="agency-timeline-item"><span><i className="fa-solid fa-shield-halved" /></span><h3>Data Terverifikasi</h3><p>Informasi resmi ditampilkan setelah tersedia dan diperiksa.</p></div></div>
    </section>

    <section className="agency-section agency-section-muted" id="dokumen">
      <div className="agency-container"><div className="agency-section-heading"><h2>Dokumen Publik</h2><p>Ruang untuk dokumen resmi yang telah diterima dan diverifikasi.</p></div><div className="agency-document-panel"><span className="agency-document-icon"><i className="fa-solid fa-folder-open" /></span><div><h3>Pusat Dokumen Desa</h3><p>Bagian ini disiapkan untuk peraturan desa, dokumen perencanaan, laporan pembangunan, dan dokumen publik lainnya setelah tersedia.</p></div><span className="agency-document-status">MENUNGGU DATA RESMI</span></div></div>
    </section>

    <section className="agency-section agency-transparency" id="transparansi"><div className="agency-container agency-transparency-inner"><div><p className="agency-kicker">AKUNTABILITAS PUBLIK</p><h2>Transparansi dimulai dari data yang benar.</h2><p>Informasi anggaran dan pembangunan akan ditampilkan setelah dokumen resmi tersedia. Angka perkiraan tidak ditampilkan sebagai data pemerintah desa.</p></div><div className="agency-transparency-mark"><i className="fa-solid fa-chart-line" /><strong>Transparansi Desa</strong><span>Menunggu data resmi terverifikasi</span></div></div></section>

    <section className="agency-section agency-participation" id="partisipasi"><div className="agency-container agency-participation-inner"><span className="agency-participation-icon"><i className="fa-solid fa-comments" /></span><div><h2>Partisipasi warga penting.</h2><p>Fitur aspirasi dan partisipasi masyarakat akan dikembangkan secara bertahap setelah alur pengelolaan dan penanggung jawab ditetapkan.</p></div></div></section>

    <footer className="agency-footer"><div className="agency-container agency-footer-inner"><a className="agency-brand agency-footer-brand" href="#top"><span className="agency-brand-symbol">B</span><span>DESA BAWANGAN</span></a><p>© {new Date().getFullYear()} Pemerintah Desa Bawangan<br />Kecamatan Ploso · Kabupaten Jombang</p><a className="agency-back-top" href="#top" aria-label="Kembali ke atas"><i className="fa-solid fa-arrow-up" /></a></div><div className="agency-container agency-credit">PORTAL INFORMASI PUBLIK DESA BAWANGAN</div></footer>
  </main>;
}
