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
  const [activeLeader, setActiveLeader] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveLeader((current) => (current + 1) % 12), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    if (!supabase) { setLoaded(true); return; }
    void supabase.from('posts').select('id,title,slug,summary,category,published_at').eq('status', 'published').order('published_at', { ascending: false }).limit(7).then(({ data }) => {
      if (active) { setPosts((data ?? []) as PublicPost[]); setLoaded(true); }
    });
    return () => { active = false; };
  }, [supabase]);

  const leaders = [
            {name:'Bakhtiar Efendi, S.H',role:'Kepala Desa',image:'https://desabawangan.id/storage/leaders/OcR5odT577lIy6cS8NuWjyhG5hy50wVP0C97fAFQ.png'},
            {name:'Teguh Wahyudi',role:'Sekretaris Desa',image:'https://desabawangan.id/storage/leaders/L2B7UQCXEDGCced5o57GMaZZKkySt8H1IupOm7BP.jpg'},
            {name:'Suliswanto',role:'Kaur Keuangan',image:'https://desabawangan.id/storage/leaders/vrSmPmJbN4gn6haqqxyVAYYOALGSRbiS1nmETTXC.jpg'},
            {name:'Mustika Dwi Anjar Kurnia S',role:'Kaur Umum & Tata Usaha',image:'https://desabawangan.id/storage/leaders/NWERPzLtPwJShWkr5fb9RtpGXBokh8OYuigmJP4j.png'},
            {name:'Bagas Aprilyanto',role:'Kaur Perencanaan',image:'https://desabawangan.id/storage/leaders/qQOY2BY8XkrjeHpf62JSGotUDT2zTLsOEWc4OhGe.png'},
            {name:'Tuhuningtyas',role:'Kasi Pemerintahan',image:'https://desabawangan.id/storage/leaders/akREa2N5qBdBzyRFxoZY4XpcvO0ZRgXbv0OrSmfA.png'},
            {name:"Mu'in",role:'Kasi Kesejahteraan',image:'https://desabawangan.id/storage/leaders/oRxuBpdye7mBaLVV6NJV0SHbKPJGG9vJz24Aqx6f.png'},
            {name:'Dartik',role:'Kasi Pelayanan',image:'https://desabawangan.id/storage/leaders/2ifighQXLnlwV00BcuILrqrvW6lLFrJKuHPhVayL.png'},
            {name:'Hadi Mulyono',role:'Kasun Bawangan',image:'https://desabawangan.id/storage/leaders/U565k6y8Ja8oUld8o0TFrmzzMdNch0vEKo7nNLUZ.png'},
            {name:'Eko Subekti',role:'Kasun Ngumpak',image:'https://desabawangan.id/storage/leaders/acVCyNkECCJ6leUYNXq8A0fHImIsCJBScQPxrABw.png'},
            {name:'Lisanah',role:'Kasun Jabon',image:'https://desabawangan.id/storage/leaders/xEWKzLuIvD9ZOOhTLtd62hQNtoc0Z0VVJDWQclpN.png'},
            {name:'Bambang Indramanto, SE.',role:'Kasun Kesamben',image:'https://desabawangan.id/storage/leaders/NAEXO2Ny4nctDA23wllbE8e9VRC1PtE09X3pfVdt.png'},

  ];
  const featured = posts[0];
  return <main className="agency-site" id="top">
    <nav className="agency-nav" aria-label="Navigasi utama">
      <div className="agency-container agency-nav-inner">
        <a className="agency-brand" href="#top" aria-label="Bawangan Maju Bersama beranda"><img className="agency-brand-logo" src="https://desabawangan.id/logo/jombang.png" alt="Lambang Kabupaten Jombang" /><span>BAWANGAN MAJU BERSAMA</span></a>
        <button className="agency-menu-toggle" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>MENU <i className="fa-solid fa-bars" /></button>
        <div className={`agency-nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#top" onClick={(event) => { setMenuOpen(false); event.currentTarget.closest(".agency-nav-links")?.querySelectorAll("details.agency-nav-dropdown").forEach((item) => item.removeAttribute("open")); }}>BERANDA</a>
          <details className="agency-nav-dropdown"><summary onClick={(event) => { const current = event.currentTarget.parentElement; current?.parentElement?.querySelectorAll("details.agency-nav-dropdown").forEach((item) => { if (item !== current) item.removeAttribute("open"); }); }}>PROFIL <i className="fa-solid fa-chevron-down" aria-hidden="true" /></summary><div className="agency-dropdown-panel">
            <a href="#profil" onClick={() => setMenuOpen(false)}>Selayang Pandang</a><a href="#sejarah" onClick={() => setMenuOpen(false)}>Sejarah / Asal Usul Desa</a><a href="#visi-misi" onClick={() => setMenuOpen(false)}>Visi dan Misi</a><a href="#pemerintahan" onClick={() => setMenuOpen(false)}>Struktur Pemerintahan</a><a href="#kepala-desa" onClick={() => setMenuOpen(false)}>Profil Kepala Desa</a><a href="#pemerintahan" onClick={() => setMenuOpen(false)}>Profil Perangkat Desa</a><a href="#wilayah" onClick={() => setMenuOpen(false)}>Wilayah dan Peta Desa</a><a href="#produk-hukum" onClick={() => setMenuOpen(false)}>Produk Hukum</a><a href="#idm-sdgs" onClick={() => setMenuOpen(false)}>IDM dan SDGs Desa</a>
          </div></details>
          <details className="agency-nav-dropdown"><summary onClick={(event) => { const current = event.currentTarget.parentElement; current?.parentElement?.querySelectorAll("details.agency-nav-dropdown").forEach((item) => { if (item !== current) item.removeAttribute("open"); }); }}>DATA DESA <i className="fa-solid fa-chevron-down" aria-hidden="true" /></summary><div className="agency-dropdown-panel">
            <a href="#data-wilayah" onClick={() => setMenuOpen(false)}>Data Wilayah</a><a href="#statistik" onClick={() => setMenuOpen(false)}>Statistik Penduduk</a><a href="#data-pendidikan-kk" onClick={() => setMenuOpen(false)}>Pendidikan dalam KK</a><a href="#data-pendidikan" onClick={() => setMenuOpen(false)}>Pendidikan Ditempuh</a><a href="#data-pekerjaan" onClick={() => setMenuOpen(false)}>Data Pekerjaan</a><a href="#data-agama" onClick={() => setMenuOpen(false)}>Data Agama</a><a href="#data-sosial" onClick={() => setMenuOpen(false)}>Data Sosial</a><a href="#dokumen" onClick={() => setMenuOpen(false)}>Dokumen Perencanaan</a>
          </div></details>
          <details className="agency-nav-dropdown"><summary onClick={(event) => { const current = event.currentTarget.parentElement; current?.parentElement?.querySelectorAll("details.agency-nav-dropdown").forEach((item) => { if (item !== current) item.removeAttribute("open"); }); }}>LAYANAN <i className="fa-solid fa-chevron-down" aria-hidden="true" /></summary><div className="agency-dropdown-panel">
            <a href="#layanan" onClick={() => setMenuOpen(false)}>Informasi Layanan</a><a href="#layanan-administrasi" onClick={() => setMenuOpen(false)}>Layanan Administrasi</a><a href="#pengaduan" onClick={() => setMenuOpen(false)}>Pengaduan Warga</a><a href="#partisipasi" onClick={() => setMenuOpen(false)}>Aspirasi dan Partisipasi</a>
          </div></details>
          <a href="#ppid" onClick={() => setMenuOpen(false)}>PPID</a>
          <details className="agency-nav-dropdown"><summary onClick={(event) => { const current = event.currentTarget.parentElement; current?.parentElement?.querySelectorAll("details.agency-nav-dropdown").forEach((item) => { if (item !== current) item.removeAttribute("open"); }); }}>TRANSPARANSI <i className="fa-solid fa-chevron-down" aria-hidden="true" /></summary><div className="agency-dropdown-panel">
            <a href="#transparansi" onClick={() => setMenuOpen(false)}>Ringkasan Transparansi</a><a href="#apbdes" onClick={() => setMenuOpen(false)}>APBDes dan Realisasi</a><a href="#rkpdes" onClick={() => setMenuOpen(false)}>RKP Desa</a><a href="#rpjmdes" onClick={() => setMenuOpen(false)}>RPJM Desa</a><a href="#laporan-pembangunan" onClick={() => setMenuOpen(false)}>Laporan Pembangunan</a><a href="#dokumen" onClick={() => setMenuOpen(false)}>Dokumen Publik</a>
          </div></details>
          <details className="agency-nav-dropdown"><summary onClick={(event) => { const current = event.currentTarget.parentElement; current?.parentElement?.querySelectorAll("details.agency-nav-dropdown").forEach((item) => { if (item !== current) item.removeAttribute("open"); }); }}>DESA ANTI KORUPSI <i className="fa-solid fa-chevron-down" aria-hidden="true" /></summary><div className="agency-dropdown-panel">
            <a href="#anti-tatalaksana" onClick={() => setMenuOpen(false)}>Penguatan Tata Laksana</a><a href="#anti-pengawasan" onClick={() => setMenuOpen(false)}>Penguatan Pengawasan</a><a href="#anti-pelayanan" onClick={() => setMenuOpen(false)}>Kualitas Pelayanan Publik</a><a href="#anti-partisipasi" onClick={() => setMenuOpen(false)}>Partisipasi Masyarakat</a><a href="#anti-kearifan" onClick={() => setMenuOpen(false)}>Kearifan Lokal</a><a href="#pengaduan" onClick={() => setMenuOpen(false)}>Kanal Pengaduan</a>
          </div></details>
          <details className="agency-nav-dropdown"><summary onClick={(event) => { const current = event.currentTarget.parentElement; current?.parentElement?.querySelectorAll("details.agency-nav-dropdown").forEach((item) => { if (item !== current) item.removeAttribute("open"); }); }}>LAYANAN WARGA <i className="fa-solid fa-chevron-down" aria-hidden="true" /></summary><div className="agency-dropdown-panel">
            <a href="#layanan" onClick={() => setMenuOpen(false)}>Katalog Layanan Desa</a><a href="#layanan-administrasi" onClick={() => setMenuOpen(false)}>Administrasi Desa</a><a href="#jaring-pengaman-sosial" onClick={() => setMenuOpen(false)}>Jaring Pengaman Sosial</a><a href="#pasar-desa" onClick={() => setMenuOpen(false)}>Pasar / Lapak UMKM</a><a href="#ambulans-desa" onClick={() => setMenuOpen(false)}>Informasi Ambulans Desa</a><a href="#laporan-pembangunan" onClick={() => setMenuOpen(false)}>Laporan Pembangunan</a><a href="#pengaduan" onClick={() => setMenuOpen(false)}>Aspirasi dan Pengaduan</a><a href="#komunitas-digital" onClick={() => setMenuOpen(false)}>Komunitas Digital</a><a href="#klinik-umkm" onClick={() => setMenuOpen(false)}>Klinik UMKM</a><a href="#posyantek" onClick={() => setMenuOpen(false)}>Posyantek</a><a href="#wifi-publik" onClick={() => setMenuOpen(false)}>Wi-Fi Publik</a><a href="#perpustakaan" onClick={() => setMenuOpen(false)}>Perpustakaan Desa</a>
          </div></details>
        </div>
      </div>
    </nav>

    <header className="agency-masthead" style={{ backgroundImage: "linear-gradient(90deg,rgba(12,24,18,.78),rgba(12,24,18,.34)),url(https://desabawangan.id/storage/slides/BdoQSC5un52Mu8MoEUkyyuDPQRuJTrHCuWjT3gK7.jpg)" }}>
      <div className="agency-container agency-masthead-content">
        <p className="agency-kicker">WEBSITE RESMI PEMERINTAH DESA</p>
        <h1>Bawangan Maju<br />Bersama</h1>
        <p className="agency-subtitle">Informasi publik, pelayanan, dan kabar desa dalam satu ruang digital yang mudah diakses oleh semua warga.</p>
        <a className="agency-button" href="#layanan">JELAJAHI LAYANAN <i className="fa-solid fa-arrow-right" /></a>
      </div>
      <div className="agency-masthead-caption">KECAMATAN PLOSO <span>•</span> KABUPATEN JOMBANG <span>•</span> JAWA TIMUR</div>
      <div className="agency-info-ticker" aria-label="Informasi Desa Bawangan">
        <div className="agency-info-label"><span className="agency-info-pulse" aria-hidden="true" /><i className="fa-solid fa-bullhorn" aria-hidden="true" /><span>INFO DESA</span></div>
        <div className="agency-info-window">
          <div className="agency-info-track">
            <div className="agency-info-group">
              <span className="agency-info-item"><i className="fa-solid fa-circle-check" aria-hidden="true" /> Selamat datang di website Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang.</span>
              <span className="agency-info-separator">•</span>
              <Link className="agency-info-item" href="/informasi/?slug=juara-3-lomba-gerak-jalan"><i className="fa-solid fa-newspaper" aria-hidden="true" /> <strong>KABAR DESA:</strong> Semangat dan Kekompakan Desa Bawangan Berbuah Juara 3 Lomba Gerak Jalan Tingkat Kecamatan</Link>
              <span className="agency-info-separator">•</span>
              <Link className="agency-info-item" href="/informasi/?slug=pemetaan-kebutuhan-desa-convex"><i className="fa-solid fa-newspaper" aria-hidden="true" /> <strong>KABAR DESA:</strong> KPM 01 UNIPDU Petakan Kebutuhan Desa dan Pasang Tujuh Convex</Link>
              <span className="agency-info-separator">•</span>
              <Link className="agency-info-item" href="/informasi/?slug=desa-bawangan-berseri"><i className="fa-solid fa-newspaper" aria-hidden="true" /> <strong>KABAR DESA:</strong> Dorong Desa Bawangan Menjadi Desa Berseri melalui kolaborasi KPM 01 UNIPDU dan DLH</Link>
              <span className="agency-info-separator">•</span>
              <span className="agency-info-item"><i className="fa-solid fa-seedling" aria-hidden="true" /> Merawat tradisi, mendorong kemandirian ekonomi, dan membangun Desa Bawangan yang sejahtera.</span>
              <span className="agency-info-separator">•</span>
            </div>
            <div className="agency-info-group" aria-hidden="true">
              <span className="agency-info-item"><i className="fa-solid fa-circle-check" aria-hidden="true" /> Selamat datang di website Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang.</span>
              <span className="agency-info-separator">•</span>
              <span className="agency-info-item"><i className="fa-solid fa-newspaper" aria-hidden="true" /> <strong>KABAR DESA:</strong> Semangat dan Kekompakan Desa Bawangan Berbuah Juara 3 Lomba Gerak Jalan Tingkat Kecamatan</span>
              <span className="agency-info-separator">•</span>
              <span className="agency-info-item"><i className="fa-solid fa-newspaper" aria-hidden="true" /> <strong>KABAR DESA:</strong> KPM 01 UNIPDU Petakan Kebutuhan Desa dan Pasang Tujuh Convex</span>
              <span className="agency-info-separator">•</span>
              <span className="agency-info-item"><i className="fa-solid fa-newspaper" aria-hidden="true" /> <strong>KABAR DESA:</strong> Dorong Desa Bawangan Menjadi Desa Berseri melalui kolaborasi KPM 01 UNIPDU dan DLH</span>
              <span className="agency-info-separator">•</span>
              <span className="agency-info-item"><i className="fa-solid fa-seedling" aria-hidden="true" /> Merawat tradisi, mendorong kemandirian ekonomi, dan membangun Desa Bawangan yang sejahtera.</span>
              <span className="agency-info-separator">•</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section className="agency-section" id="sejarah">
      <div className="agency-container">
        <div className="agency-section-heading">
          <p className="agency-kicker agency-kicker-green">MENGENAL BAWANGAN</p>
          <h2>Sejarah &amp; Profil Desa</h2>
          <p>Ringkasan identitas, sejarah, dan kondisi Desa Bawangan.</p>
        </div>
        <div className="agency-profile-layout">
          <article className="agency-profile-card agency-history-card">
            <span className="agency-profile-eyebrow">SEJARAH DESA</span>
            <h3>Desa Bawangan</h3>
            <p>Bagian sejarah Desa Bawangan disiapkan sebagai ruang untuk mendokumentasikan asal-usul desa, perkembangan wilayah, serta kisah masyarakat dari masa ke masa. Narasi sejarah yang lebih terperinci akan dimuat setelah dikonfirmasi melalui sumber dan dokumen resmi desa, agar informasi yang diterbitkan tetap akurat.</p>
          </article>
          <article className="agency-profile-card" id="profil">
            <span className="agency-profile-eyebrow">PROFIL DESA</span>
            <h3>Identitas dan Pelayanan</h3>
            <p>Desa Bawangan berlokasi di Jalan Tanjung Wadung No. 17, Bawangan, Kecamatan Ploso, Kabupaten Jombang, Jawa Timur 61453. Sebagai pusat pemerintahan dan pelayanan masyarakat, Pemerintah Desa Bawangan berupaya meningkatkan pelayanan publik yang ramah, transparan, dan akuntabel demi kemajuan serta kesejahteraan warga.</p>
            <dl className="agency-profile-details">
              <div><dt>Alamat kantor</dt><dd>Jalan Tanjung Wadung No. 17, Bawangan, Ploso, Jombang, Jawa Timur 61453</dd></div>
              <div><dt>Telepon</dt><dd><a href="tel:085231263646">0852-3126-3646</a></dd></div>
              <div><dt>Email</dt><dd><a href="mailto:desabawanganmajubersama@gmail.com">desabawanganmajubersama@gmail.com</a></dd></div>
              <div><dt>Luas wilayah</dt><dd>Angka yang diberikan: 1774 km² <small>Perlu konfirmasi kembali angka dan satuan luas sebelum ditetapkan sebagai data resmi.</small></dd></div>
            </dl>
            <div className="agency-regency-mark"><img src="https://desabawangan.id/logo/jombang.png" alt="Lambang Kabupaten Jombang" loading="lazy" /><span>Lambang Kabupaten Jombang</span></div>
          </article>
        </div>
        <div className="agency-section-heading agency-vision-heading" id="visi-misi">
          <p className="agency-kicker agency-kicker-green">ARAH PEMBANGUNAN</p>
          <h2>Visi &amp; Misi Desa</h2>
          <p>Fokus pada arah dan tujuan Desa Bawangan.</p>
        </div>
        <article className="agency-vision-card">
          <span className="agency-profile-eyebrow">VISI DESA</span>
          <blockquote>“Terwujudnya Desa Bawangan Yang Rukun dan Makmur Berlandaskan Moral Agama serta Terdepan Dalam Bidang Pertanian”</blockquote>
        </article>
        <div className="agency-mission-heading"><span className="agency-profile-eyebrow">MISI DESA</span><h3>Langkah untuk mewujudkan visi</h3></div>
        <ol className="agency-mission-list">
          <li>Mewujudkan dan mengembangkan kegiatan keagamaan untuk menambah keimanan dan ketakwaan kepada Tuhan Yang Maha Esa.</li>
          <li>Mewujudkan dan mendorong kerukunan antarwarga maupun intern warga masyarakat di tengah perbedaan agama, keyakinan, organisasi, dan lainnya, dalam suasana saling menghargai dan menghormati.</li>
          <li>Membangun dan meningkatkan hasil pertanian melalui penataan pengairan, perbaikan jalan sawah atau jalan usaha tani, pemupukan, dan pola tanam yang baik.</li>
          <li>Menata Pemerintahan Desa Bawangan yang kompak dan bertanggung jawab dalam mengemban amanat masyarakat.</li>
          <li>Meningkatkan pelayanan masyarakat secara terpadu dan serius.</li>
          <li>Mencari dan menambah debit air untuk mencukupi kebutuhan pertanian.</li>
          <li>Menumbuhkembangkan kelompok tani dan gabungan kelompok tani serta bekerja sama dengan HIPPA untuk memfasilitasi kebutuhan petani.</li>
          <li>Menumbuhkembangkan usaha kecil dan menengah.</li>
          <li>Membangun dan mendorong kemajuan pendidikan formal maupun informal yang mudah diakses seluruh warga, guna menghasilkan insan intelektual, inovatif, dan wirausahawan.</li>
          <li>Membangun dan mendorong pengembangan serta optimalisasi sektor pertanian, perkebunan, peternakan, dan perikanan, baik pada tahap produksi maupun pengolahan hasilnya.</li>
        </ol>
        <div className="agency-anchor-grid">
          <span id="kepala-desa">Pemerintahan Desa <small>Profil kepala desa dan perangkat desa</small></span>
          <span id="wilayah">Wilayah Desa <small>Lokasi Desa Bawangan di Google Maps</small></span>
          <span id="data-wilayah">Data Wilayah <small>Data resmi menyusul</small></span>
          <span id="statistik">Statistik Desa <small>Data resmi menyusul</small></span>
          <span id="data-penduduk">Data Penduduk <small>Data resmi menyusul</small></span>
          <span id="data-sosial">Data Sosial <small>Data resmi menyusul</small></span>
          <span id="produk-hukum">Produk Hukum <small>Dokumen resmi menyusul</small></span>
        </div>
        <div className="agency-village-map" aria-labelledby="agency-village-map-title">
          <div className="agency-village-map-heading">
            <div>
              <span className="agency-profile-eyebrow">LOKASI DESA</span>
              <h3 id="agency-village-map-title">Peta Wilayah Desa Bawangan</h3>
              <p>Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang, Jawa Timur</p>
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=Desa+Bawangan%2C+Kecamatan+Ploso%2C+Kabupaten+Jombang%2C+Jawa+Timur" target="_blank" rel="noreferrer">Buka di Google Maps <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></a>
          </div>
          <div className="agency-village-map-frame">
            <iframe
              title="Google Maps lokasi Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang"
              src="https://maps.google.com/maps?q=Desa%20Bawangan%2C%20Kecamatan%20Ploso%2C%20Kabupaten%20Jombang%2C%20Jawa%20Timur&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <p className="agency-village-map-note">Peta menggunakan pencarian lokasi Desa Bawangan di Google Maps. Untuk batas administrasi atau titik koordinat resmi, diperlukan data geospasial resmi desa.</p>
        </div>
      </div>
    </section>

    <section className="agency-section" id="layanan">
      <div className="agency-container">
        <div className="agency-section-heading"><h2>Layanan Desa</h2><p>Akses cepat menuju informasi dan layanan publik Desa Bawangan.</p></div>
        <div className="agency-services-grid">{services.map(service => <a className="agency-service" href={service.href} key={service.title}><span className="agency-service-icon"><i className={`fa-solid ${service.icon}`} /></span><h3>{service.title}</h3><p>{service.text}</p><span className="agency-service-arrow">Selengkapnya <i className="fa-solid fa-arrow-right" /></span></a>)}</div>
      </div>
    </section>

    <section className="agency-section agency-feature-directory" id="fitur-desa">
      <div className="agency-container">
        <div className="agency-section-heading"><p className="agency-kicker agency-kicker-green">SATU PORTAL UNTUK WARGA</p><h2>Direktori Informasi &amp; Layanan Desa</h2><p>Struktur fitur mengacu pada praktik portal desa digital. Informasi yang membutuhkan data, persetujuan, atau integrasi resmi ditandai sebagai tahap pengembangan.</p></div>
        <div className="agency-feature-group" id="idm-sdgs"><h3>Data dan Profil Desa</h3><div className="agency-feature-grid">
          <article className="agency-feature-card" id="data-wilayah"><i className="fa-solid fa-map-location-dot" /><h4>Data Wilayah dan Peta</h4><p>Informasi wilayah, peta lokasi, serta dokumen batas wilayah setelah tersedia dari sumber resmi.</p><a href="#wilayah">Lihat peta desa <i className="fa-solid fa-arrow-right" /></a></article>
          <article className="agency-feature-card" id="statistik"><i className="fa-solid fa-chart-pie" /><h4>Statistik Desa</h4><p>Ringkasan demografi akan diisi setelah data agregat yang sah diterima dan diverifikasi.</p><span className="agency-feature-status">Menunggu data resmi</span></article>
          <article className="agency-feature-card" id="data-pendidikan-kk"><i className="fa-solid fa-people-roof" /><h4>Pendidikan dalam KK</h4><p>Komponen statistik pendidikan keluarga, ditampilkan secara agregat tanpa membuka data pribadi.</p><span className="agency-feature-status">Tahap pengembangan</span></article>
          <article className="agency-feature-card" id="data-pendidikan"><i className="fa-solid fa-graduation-cap" /><h4>Pendidikan Ditempuh</h4><p>Informasi pendidikan warga berdasarkan data agregat yang telah diverifikasi.</p><span className="agency-feature-status">Tahap pengembangan</span></article>
          <article className="agency-feature-card" id="data-pekerjaan"><i className="fa-solid fa-briefcase" /><h4>Data Pekerjaan</h4><p>Ringkasan pekerjaan dan potensi ekonomi warga tanpa mempublikasikan data individu.</p><span className="agency-feature-status">Tahap pengembangan</span></article>
          <article className="agency-feature-card" id="data-agama"><i className="fa-solid fa-hands-praying" /><h4>Data Agama</h4><p>Hanya statistik agregat yang disahkan dan layak dipublikasikan.</p><span className="agency-feature-status">Menunggu data resmi</span></article>
        </div></div>
        <div className="agency-feature-group"><h3>Transparansi dan Dokumen</h3><div className="agency-feature-grid">
          <article className="agency-feature-card" id="rpjmdes"><i className="fa-solid fa-file-lines" /><h4>RPJM Desa</h4><p>Dokumen rencana pembangunan jangka menengah desa yang telah disahkan.</p><a href="#dokumen">Pusat dokumen <i className="fa-solid fa-arrow-right" /></a></article>
          <article className="agency-feature-card" id="rkpdes"><i className="fa-solid fa-calendar-check" /><h4>RKP Desa</h4><p>Rencana kerja tahunan dan dokumen pendukung setelah tersedia.</p><a href="#dokumen">Pusat dokumen <i className="fa-solid fa-arrow-right" /></a></article>
          <article className="agency-feature-card" id="apbdes"><i className="fa-solid fa-coins" /><h4>APBDes dan Realisasi</h4><p>Anggaran, perubahan, dan realisasi hanya ditampilkan dari dokumen resmi.</p><a href="#transparansi">Lihat transparansi <i className="fa-solid fa-arrow-right" /></a></article>
          <article className="agency-feature-card" id="produk-hukum"><i className="fa-solid fa-scale-balanced" /><h4>Produk Hukum</h4><p>Peraturan desa, perkades, keputusan, dan dokumen hukum yang telah diverifikasi.</p><a href="#dokumen">Pusat dokumen <i className="fa-solid fa-arrow-right" /></a></article>
          <article className="agency-feature-card" id="laporan-pembangunan"><i className="fa-solid fa-person-digging" /><h4>Laporan Pembangunan</h4><p>Dokumentasi dan laporan kemajuan pembangunan yang disetujui untuk publikasi.</p><a href="#dokumen">Pusat dokumen <i className="fa-solid fa-arrow-right" /></a></article>
          <article className="agency-feature-card"><i className="fa-solid fa-file-shield" /><h4>PPID dan Dokumen Publik</h4><p>Informasi tentang permohonan, klasifikasi, dan akses dokumen publik.</p><a href="#ppid">Informasi PPID <i className="fa-solid fa-arrow-right" /></a></article>
        </div></div>
        <div className="agency-feature-group"><h3>Layanan dan Komunitas</h3><div className="agency-feature-grid">
          <article className="agency-feature-card" id="pasar-desa"><i className="fa-solid fa-store" /><h4>Pasar Desa / Lapak UMKM</h4><p>Ruang promosi produk lokal. Fitur transaksi dibuka setelah pengelolaan dan kontak penjual ditetapkan.</p><span className="agency-feature-status">Tahap pengembangan</span></article>
          <article className="agency-feature-card" id="ambulans-desa"><i className="fa-solid fa-truck-medical" /><h4>Informasi Ambulans</h4><p>Kontak dan prosedur penggunaan akan dipublikasikan setelah dikonfirmasi pemerintah desa.</p><span className="agency-feature-status">Menunggu konfirmasi</span></article>
          <article className="agency-feature-card" id="pengaduan"><i className="fa-solid fa-message" /><h4>Aspirasi dan Pengaduan</h4><p>Kanal partisipasi dengan alur tindak lanjut dan penanggung jawab yang jelas.</p><span className="agency-feature-status">Tahap pengembangan</span></article>
          <article className="agency-feature-card" id="komunitas-digital"><i className="fa-solid fa-people-group" /><h4>Komunitas Digital Desa</h4><p>Ruang untuk informasi kegiatan, komunikasi, dan partisipasi masyarakat.</p><span className="agency-feature-status">Tahap pengembangan</span></article>
          <article className="agency-feature-card" id="klinik-umkm"><i className="fa-solid fa-shop" /><h4>Klinik UMKM</h4><p>Informasi konsultasi, pelatihan, dan dukungan bagi usaha mikro dan kecil.</p><span className="agency-feature-status">Tahap pengembangan</span></article>
          <article className="agency-feature-card" id="posyantek"><i className="fa-solid fa-laptop" /><h4>Posyantek</h4><p>Ruang informasi pendampingan teknologi tepat guna dan literasi digital.</p><span className="agency-feature-status">Tahap pengembangan</span></article>
          <article className="agency-feature-card" id="wifi-publik"><i className="fa-solid fa-wifi" /><h4>Wi-Fi Publik</h4><p>Lokasi, cakupan, dan ketentuan akses hanya akan ditampilkan setelah dikonfirmasi.</p><span className="agency-feature-status">Menunggu konfirmasi</span></article>
          <article className="agency-feature-card" id="perpustakaan"><i className="fa-solid fa-book-open" /><h4>Perpustakaan Desa</h4><p>Informasi layanan literasi, koleksi, dan jam operasional setelah tersedia.</p><span className="agency-feature-status">Tahap pengembangan</span></article>
          <article className="agency-feature-card" id="program-sosial"><i className="fa-solid fa-hand-holding-heart" /><h4>Jaring Pengaman Sosial</h4><p>Informasi program sosial dengan perlindungan data pribadi warga.</p><a href="#jaring-pengaman-sosial">Baca keterangan <i className="fa-solid fa-arrow-right" /></a></article>
        </div></div>
        <div className="agency-feature-group" id="anti-korupsi"><h3>Penguatan Desa Antikorupsi</h3><div className="agency-feature-grid agency-feature-grid-compact">
          <article className="agency-feature-card" id="anti-tatalaksana"><i className="fa-solid fa-list-check" /><h4>Penguatan Tata Laksana</h4><p>Informasi prosedur dan standar kerja yang transparan.</p><span className="agency-feature-status">Program menunggu penetapan</span></article>
          <article className="agency-feature-card" id="anti-pengawasan"><i className="fa-solid fa-shield-halved" /><h4>Penguatan Pengawasan</h4><p>Dokumentasi pengawasan dan mekanisme pelaporan yang akuntabel.</p><span className="agency-feature-status">Program menunggu penetapan</span></article>
          <article className="agency-feature-card" id="anti-pelayanan"><i className="fa-solid fa-handshake-angle" /><h4>Kualitas Pelayanan Publik</h4><p>Informasi standar layanan, waktu, biaya, dan prosedur setelah disahkan.</p><span className="agency-feature-status">Program menunggu penetapan</span></article>
          <article className="agency-feature-card" id="anti-partisipasi"><i className="fa-solid fa-users" /><h4>Partisipasi Masyarakat</h4><p>Ruang untuk pelibatan warga dalam perencanaan dan pengawasan.</p><span className="agency-feature-status">Program menunggu penetapan</span></article>
          <article className="agency-feature-card" id="anti-kearifan"><i className="fa-solid fa-seedling" /><h4>Kearifan Lokal</h4><p>Pelestarian budaya, tradisi, dan nilai masyarakat Desa Bawangan.</p><span className="agency-feature-status">Program menunggu penetapan</span></article>
        </div></div>
      </div>
    </section>

    <section className="agency-section agency-section-muted" id="berita">
      <div className="agency-container">
        <div className="agency-section-heading"><h2>Berita &amp; Informasi</h2><p>Kabar dan kegiatan Desa Bawangan yang dihimpun dari kolom berita desa.</p></div>
        <div className="agency-news-grid agency-source-news-grid">
          <article className="agency-news-card"><img className="agency-news-photo" src="https://desabawangan.id/storage/news/LlmkK7KqKcRCf3a93VhWEFlEhSFZi2HUapdFLonG.jpg" alt="Kegiatan lomba gerak jalan Desa Bawangan" loading="lazy" /><span className="agency-tag">Berita Desa</span><h3>Semangat dan Kekompakan Desa Bawangan Berbuah Juara 3 Lomba Gerak Jalan Tingkat Kecamatan</h3><p>Kabar tentang partisipasi dan pencapaian Desa Bawangan dalam lomba gerak jalan tingkat kecamatan.</p><Link className="agency-text-link" href="/informasi?slug=juara-3-lomba-gerak-jalan">BACA BERITA <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link></article>
          <article className="agency-news-card"><img className="agency-news-photo" src="https://desabawangan.id/storage/news/cBDG0yR5N8SceueKo3BzS8eLL5RqnAPeNAiiqidl.jpg" alt="Kegiatan pemetaan kebutuhan Desa Bawangan" loading="lazy" /><span className="agency-tag">Berita Desa</span><h3>KPM 01 UNIPDU Petakan Kebutuhan Desa dan Pasang Tujuh Convex</h3><p>Informasi kegiatan KPM 01 UNIPDU terkait pemetaan kebutuhan desa dan pemasangan tujuh convex.</p><Link className="agency-text-link" href="/informasi?slug=pemetaan-kebutuhan-desa-convex">BACA BERITA <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link></article>
          <article className="agency-news-card"><img className="agency-news-photo" src="https://desabawangan.id/storage/news/nhgkuOQkgTLwfvE0EFuU6EV3c3cZbWz0jLE2pmWm.jpg" alt="Kegiatan lingkungan Desa Bawangan" loading="lazy" /><span className="agency-tag">Berita Desa</span><h3>Dorong Desa Bawangan Menjadi Desa Berseri melalui Kolaborasi KPM 01 UNIPDU dan DLH</h3><p>Kabar kolaborasi KPM 01 UNIPDU dan DLH untuk mendorong upaya lingkungan di Desa Bawangan.</p><Link className="agency-text-link" href="/informasi?slug=desa-bawangan-berseri">BACA BERITA <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link></article>
        </div>
        {posts.length > 0 && <div className="agency-section-heading agency-local-news-heading"><h3>Berita yang diterbitkan melalui portal ini</h3><p>Informasi yang dipublikasikan pengelola website Bawangan Maju Bersama.</p></div>}
        <div className="agency-news-grid">{posts.map((post, index) => <article className="agency-news-card" key={post.id}><span className="agency-tag">{labels[post.category]}</span><p className="agency-date">{formatDate(post.published_at)}</p><h3>{post.title}</h3><p>{post.summary || 'Informasi resmi dari Pemerintah Desa Bawangan.'}</p><Link className="agency-text-link" href={`/informasi?slug=${encodeURIComponent(post.slug)}`}>BACA <i className="fa-solid fa-arrow-right" /></Link></article>)}</div>
        {loaded && posts.length === 0 && <p className="agency-source-note">Berita desa di atas ditampilkan berdasarkan judul dan materi berita yang tersedia dari sumber berita Desa Bawangan.</p>}
        {!loaded && <p className="agency-loading">Memuat berita dari portal ini…</p>}
      </div>
    </section>

    <section className="agency-section" id="pemerintahan">
      <div className="agency-container">
        <div className="agency-section-heading"><h2>Perangkat Desa</h2><p>Gunakan panah atau titik navigasi untuk melihat foto dan jabatan setiap perangkat Desa Bawangan.</p></div>
        <div className="agency-leaders-carousel" aria-roledescription="carousel" aria-label="Foto perangkat Desa Bawangan">
          <button className="agency-carousel-arrow" type="button" aria-label="Perangkat sebelumnya" onClick={() => setActiveLeader((activeLeader - 1 + leaders.length) % leaders.length)}><i className="fa-solid fa-chevron-left" /></button>
          <article className="agency-leader-slide" aria-live="polite" key={leaders[activeLeader].name}>
            <div className="agency-leader-slide-photo"><img src={leaders[activeLeader].image} alt={`Foto ${leaders[activeLeader].name}`} loading="lazy" /></div>
            <div className="agency-leader-slide-info"><span className="agency-leader-count">{String(activeLeader + 1).padStart(2, '0')} / {String(leaders.length).padStart(2, '0')}</span><h3>{leaders[activeLeader].name}</h3><p>{leaders[activeLeader].role}</p><span className="agency-leader-rule" /></div>
          </article>
          <button className="agency-carousel-arrow" type="button" aria-label="Perangkat berikutnya" onClick={() => setActiveLeader((activeLeader + 1) % leaders.length)}><i className="fa-solid fa-chevron-right" /></button>
        </div>
        <div className="agency-carousel-dots" aria-label="Pilih perangkat desa">
          {leaders.map((person, index) => <button key={person.name} type="button" className={index === activeLeader ? 'is-active' : ''} aria-label={`Tampilkan ${person.name}`} aria-current={index === activeLeader ? 'true' : undefined} onClick={() => setActiveLeader(index)} />)}
        </div>
        <p className="agency-source-note">Nama dan jabatan mengikuti daftar yang diberikan. Mohon verifikasi kembali kepada pemerintah desa sebelum dijadikan publikasi final.</p>
      </div>
    </section>

    <section className="agency-section agency-about" id="tentang-desa">
      <div className="agency-container agency-about-grid"><div><p className="agency-kicker agency-kicker-green">MENGENAL DESA</p><h2>Bersama membangun<br />Desa Bawangan.</h2></div><div><p>Portal ini menjadi titik awal akses informasi publik Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang. Profil, potensi, kegiatan, dan informasi wilayah akan dilengkapi berdasarkan data resmi pemerintah desa.</p><a className="agency-text-link" href="#dokumen">JELAJAHI INFORMASI <i className="fa-solid fa-arrow-right" /></a></div></div>
      <div className="agency-container agency-timeline"><div className="agency-timeline-item"><span><i className="fa-solid fa-bullhorn" /></span><h3>Informasi Terbuka</h3><p>Berita dan pengumuman desa dalam satu portal.</p></div><div className="agency-timeline-item"><span><i className="fa-solid fa-people-group" /></span><h3>Warga Terhubung</h3><p>Informasi yang mudah dijangkau dari berbagai perangkat.</p></div><div className="agency-timeline-item"><span><i className="fa-solid fa-shield-halved" /></span><h3>Data Terverifikasi</h3><p>Informasi resmi ditampilkan setelah tersedia dan diperiksa.</p></div></div>
    </section>

    <section className="agency-section agency-section-muted" id="ppid"><div className="agency-container"><div className="agency-section-heading"><h2>PPID Desa</h2><p>Pejabat Pengelola Informasi dan Dokumentasi — akses informasi publik secara terbuka dan bertanggung jawab.</p></div><div className="agency-document-panel"><span className="agency-document-icon"><i className="fa-solid fa-scale-balanced" /></span><div><h3>Layanan Informasi Publik</h3><p>Ruang PPID disiapkan untuk daftar informasi publik, prosedur permohonan, maklumat pelayanan, serta dokumen yang telah diverifikasi. Alur dan kontak resmi akan ditambahkan setelah ditetapkan oleh pemerintah desa.</p></div><span className="agency-document-status">PERSIAPAN</span></div></div></section>

    <section className="agency-section agency-section-muted" id="dokumen">
      <div className="agency-container"><div className="agency-section-heading"><h2>Dokumen Publik</h2><p>Ruang untuk dokumen resmi yang telah diterima dan diverifikasi.</p></div><div className="agency-document-panel"><span className="agency-document-icon"><i className="fa-solid fa-folder-open" /></span><div><h3>Pusat Dokumen Desa</h3><p>Bagian ini disiapkan untuk peraturan desa, dokumen perencanaan, laporan pembangunan, dan dokumen publik lainnya setelah tersedia.</p></div><span className="agency-document-status">MENUNGGU DATA RESMI</span></div></div>
    </section>

    <section className="agency-section agency-section-muted" id="jaring-pengaman-sosial"><div className="agency-container"><div className="agency-section-heading"><h2>Jaring Pengaman Sosial</h2><p>Informasi program perlindungan sosial dan layanan terkait akan disajikan berdasarkan data yang sah serta kewenangan akses yang sesuai.</p></div><div className="agency-document-panel"><span className="agency-document-icon"><i className="fa-solid fa-hand-holding-heart" /></span><div><h3>Informasi Program Sosial</h3><p>Data penerima bantuan atau kondisi keluarga tidak akan ditampilkan terbuka tanpa dasar, verifikasi, dan perlindungan privasi yang memadai.</p></div><span className="agency-document-status">MENUNGGU DATA RESMI</span></div></div></section>

    <section className="agency-section agency-transparency" id="transparansi"><div className="agency-container agency-transparency-inner"><div><p className="agency-kicker">AKUNTABILITAS PUBLIK</p><h2>Transparansi dimulai dari data yang benar.</h2><p>Informasi anggaran dan pembangunan akan ditampilkan setelah dokumen resmi tersedia. Angka perkiraan tidak ditampilkan sebagai data pemerintah desa.</p></div><div className="agency-transparency-mark"><i className="fa-solid fa-chart-line" /><strong>Transparansi Desa</strong><span>Menunggu data resmi terverifikasi</span></div></div></section>

    <section className="agency-section agency-participation" id="partisipasi"><span id="layanan-administrasi" /><div className="agency-container agency-participation-inner"><span className="agency-participation-icon"><i className="fa-solid fa-comments" /></span><div><h2>Partisipasi warga penting.</h2><p>Fitur aspirasi dan partisipasi masyarakat akan dikembangkan secara bertahap setelah alur pengelolaan dan penanggung jawab ditetapkan.</p></div></div></section>

    <footer className="agency-footer"><div className="agency-container agency-footer-inner"><a className="agency-brand agency-footer-brand" href="#top"><img className="agency-brand-logo" src="https://desabawangan.id/logo/jombang.png" alt="Lambang Kabupaten Jombang" /><span>BAWANGAN MAJU BERSAMA</span></a><p>© {new Date().getFullYear()} Pemerintah Desa Bawangan<br />Kecamatan Ploso · Kabupaten Jombang</p><a className="agency-back-top" href="#top" aria-label="Kembali ke atas"><i className="fa-solid fa-arrow-up" /></a></div><div className="agency-container agency-credit">PORTAL INFORMASI PUBLIK DESA BAWANGAN</div></footer>
  </main>;
}
