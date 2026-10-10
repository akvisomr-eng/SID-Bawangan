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
        <a className="agency-brand" href="#top" aria-label="Bawangan Maju Bersama beranda"><span className="agency-brand-symbol">B</span><span>BAWANGAN MAJU BERSAMA</span></a>
        <button className="agency-menu-toggle" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>MENU <i className="fa-solid fa-bars" /></button>
        <div className={`agency-nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#top" onClick={() => setMenuOpen(false)}>BERANDA</a>
          <details className="agency-nav-dropdown"><summary>PROFIL <i className="fa-solid fa-chevron-down" /></summary><div className="agency-dropdown-panel">
            <a href="#profil" onClick={() => setMenuOpen(false)}>Profil Desa</a><a href="#sejarah" onClick={() => setMenuOpen(false)}>Sejarah Desa</a><a href="#visi-misi" onClick={() => setMenuOpen(false)}>Visi dan Misi</a><a href="#pemerintahan" onClick={() => setMenuOpen(false)}>Pemerintahan Desa</a><a href="#wilayah" onClick={() => setMenuOpen(false)}>Wilayah Desa</a>
          </div></details>
          <details className="agency-nav-dropdown"><summary>DATA DESA <i className="fa-solid fa-chevron-down" /></summary><div className="agency-dropdown-panel">
            <a href="#data-wilayah" onClick={() => setMenuOpen(false)}>Data Wilayah</a><a href="#statistik" onClick={() => setMenuOpen(false)}>Statistik Desa</a><a href="#data-penduduk" onClick={() => setMenuOpen(false)}>Data Penduduk</a><a href="#data-sosial" onClick={() => setMenuOpen(false)}>Data Sosial</a><a href="#dokumen" onClick={() => setMenuOpen(false)}>Dokumen Perencanaan</a><a href="#transparansi" onClick={() => setMenuOpen(false)}>Data Pembangunan</a><a href="#produk-hukum" onClick={() => setMenuOpen(false)}>Produk Hukum</a>
          </div></details>
          <details className="agency-nav-dropdown"><summary>LAYANAN <i className="fa-solid fa-chevron-down" /></summary><div className="agency-dropdown-panel">
            <a href="#layanan" onClick={() => setMenuOpen(false)}>Informasi Layanan</a><a href="#layanan-administrasi" onClick={() => setMenuOpen(false)}>Layanan Administrasi</a><a href="#pengaduan" onClick={() => setMenuOpen(false)}>Pengaduan Warga</a><a href="#partisipasi" onClick={() => setMenuOpen(false)}>Aspirasi dan Partisipasi</a>
          </div></details>
          <a href="#ppid" onClick={() => setMenuOpen(false)}>PPID</a>
          <details className="agency-nav-dropdown"><summary>DESA ANTI KORUPSI <i className="fa-solid fa-chevron-down" /></summary><div className="agency-dropdown-panel">
            <a href="#transparansi" onClick={() => setMenuOpen(false)}>Transparansi Anggaran</a><a href="#laporan-pembangunan" onClick={() => setMenuOpen(false)}>Laporan Pembangunan</a><a href="#produk-hukum" onClick={() => setMenuOpen(false)}>Peraturan Desa</a><a href="#anti-korupsi" onClick={() => setMenuOpen(false)}>Informasi Anti Korupsi</a><a href="#pengaduan" onClick={() => setMenuOpen(false)}>Laporkan Dugaan Pelanggaran</a>
          </div></details>
          <a href="#jaring-pengaman-sosial" onClick={() => setMenuOpen(false)}>JARING PENGAMAN SOSIAL</a>
          <Link href="/admin/login" className="agency-admin-link">PANEL ADMIN <i className="fa-solid fa-arrow-up-right-from-square" /></Link>
        </div>
      </div>
    </nav>

    <header className="agency-masthead">
      <div className="agency-container agency-masthead-content">
        <p className="agency-kicker">WEBSITE RESMI PEMERINTAH DESA</p>
        <h1>Bawangan Maju<br />Bersama</h1>
        <p className="agency-subtitle">Informasi publik, pelayanan, dan kabar desa dalam satu ruang digital yang mudah diakses oleh semua warga.</p>
        <a className="agency-button" href="#layanan">JELAJAHI LAYANAN <i className="fa-solid fa-arrow-right" /></a>
      </div>
      <div className="agency-masthead-caption">KECAMATAN PLOSO <span>•</span> KABUPATEN JOMBANG <span>•</span> JAWA TIMUR</div>
    </header>

    <section className="agency-section" id="sejarah"><div className="agency-container agency-compact-info"><p className="agency-kicker agency-kicker-green">MENGENAL BAWANGAN</p><h2>Desa Bawangan, maju bersama masyarakat.</h2><p>Informasi sejarah, visi, misi, wilayah, dan pemerintahan desa akan dipublikasikan setelah data resmi diterima dan diverifikasi.</p><div className="agency-anchor-grid"><span id="visi-misi">Visi dan Misi <small>Menunggu dokumen resmi</small></span><span id="pemerintahan">Pemerintahan Desa <small>Menunggu data resmi</small></span><span id="wilayah">Wilayah Desa <small>Menunggu data resmi</small></span><span id="data-wilayah">Data Wilayah <small>Menunggu data resmi</small></span><span id="statistik">Statistik Desa <small>Menunggu data resmi</small></span><span id="data-penduduk">Data Penduduk <small>Menunggu data resmi</small></span><span id="data-sosial">Data Sosial <small>Menunggu data resmi</small></span><span id="produk-hukum">Produk Hukum <small>Menunggu dokumen resmi</small></span></div></div></section>

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

    <section className="agency-section agency-section-muted" id="ppid"><div className="agency-container"><div className="agency-section-heading"><h2>PPID Desa</h2><p>Pejabat Pengelola Informasi dan Dokumentasi — akses informasi publik secara terbuka dan bertanggung jawab.</p></div><div className="agency-document-panel"><span className="agency-document-icon"><i className="fa-solid fa-scale-balanced" /></span><div><h3>Layanan Informasi Publik</h3><p>Ruang PPID disiapkan untuk daftar informasi publik, prosedur permohonan, maklumat pelayanan, serta dokumen yang telah diverifikasi. Alur dan kontak resmi akan ditambahkan setelah ditetapkan oleh pemerintah desa.</p></div><span className="agency-document-status">PERSIAPAN</span></div></div></section>

    <section className="agency-section agency-section-muted" id="dokumen">
      <div className="agency-container"><div className="agency-section-heading"><h2>Dokumen Publik</h2><p>Ruang untuk dokumen resmi yang telah diterima dan diverifikasi.</p></div><div className="agency-document-panel"><span className="agency-document-icon"><i className="fa-solid fa-folder-open" /></span><div><h3>Pusat Dokumen Desa</h3><p>Bagian ini disiapkan untuk peraturan desa, dokumen perencanaan, laporan pembangunan, dan dokumen publik lainnya setelah tersedia.</p></div><span className="agency-document-status">MENUNGGU DATA RESMI</span></div></div>
    </section>

    <section className="agency-section agency-section-muted" id="jaring-pengaman-sosial"><div className="agency-container"><div className="agency-section-heading"><h2>Jaring Pengaman Sosial</h2><p>Informasi program perlindungan sosial dan layanan terkait akan disajikan berdasarkan data yang sah serta kewenangan akses yang sesuai.</p></div><div className="agency-document-panel"><span className="agency-document-icon"><i className="fa-solid fa-hand-holding-heart" /></span><div><h3>Informasi Program Sosial</h3><p>Data penerima bantuan atau kondisi keluarga tidak akan ditampilkan terbuka tanpa dasar, verifikasi, dan perlindungan privasi yang memadai.</p></div><span className="agency-document-status">MENUNGGU DATA RESMI</span></div></div></section>

    <section className="agency-section agency-transparency" id="transparansi"><div className="agency-container agency-transparency-inner"><div><p className="agency-kicker">AKUNTABILITAS PUBLIK</p><h2>Transparansi dimulai dari data yang benar.</h2><p>Informasi anggaran dan pembangunan akan ditampilkan setelah dokumen resmi tersedia. Angka perkiraan tidak ditampilkan sebagai data pemerintah desa.</p></div><div className="agency-transparency-mark"><i className="fa-solid fa-chart-line" /><strong>Transparansi Desa</strong><span>Menunggu data resmi terverifikasi</span></div></div></section>

    <section className="agency-section agency-participation" id="partisipasi"><span id="pengaduan" /><span id="layanan-administrasi" /><span id="laporan-pembangunan" /><span id="anti-korupsi" /><div className="agency-container agency-participation-inner"><span className="agency-participation-icon"><i className="fa-solid fa-comments" /></span><div><h2>Partisipasi warga penting.</h2><p>Fitur aspirasi dan partisipasi masyarakat akan dikembangkan secara bertahap setelah alur pengelolaan dan penanggung jawab ditetapkan.</p></div></div></section>

    <footer className="agency-footer"><div className="agency-container agency-footer-inner"><a className="agency-brand agency-footer-brand" href="#top"><span className="agency-brand-symbol">B</span><span>BAWANGAN MAJU BERSAMA</span></a><p>© {new Date().getFullYear()} Pemerintah Desa Bawangan<br />Kecamatan Ploso · Kabupaten Jombang</p><a className="agency-back-top" href="#top" aria-label="Kembali ke atas"><i className="fa-solid fa-arrow-up" /></a></div><div className="agency-container agency-credit">PORTAL INFORMASI PUBLIK DESA BAWANGAN</div></footer>
  </main>;
}
