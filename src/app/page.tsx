'use client';

import Link from 'next/link';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type PublicPost = { id:string; title:string; slug:string; summary:string; category:'news'|'announcement'|'service'|'village_profile'; published_at:string|null };
const labels = {news:'Berita',announcement:'Pengumuman',service:'Layanan',village_profile:'Profil desa'};
const formatDate = (value:string|null) => value ? new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(new Date(value)) : 'Informasi desa';

export default function HomePage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [posts,setPosts] = useState<PublicPost[]>([]);
  const [loaded,setLoaded] = useState(false);
  useEffect(()=>{ let active=true; if(!supabase){setLoaded(true);return;} void supabase.from('posts').select('id,title,slug,summary,category,published_at').eq('status','published').order('published_at',{ascending:false}).limit(6).then(({data})=>{if(active){setPosts((data??[]) as PublicPost[]);setLoaded(true);}});return ()=>{active=false;}; },[supabase]);
  const latest = posts[0];
  return <main className="page-shell">
    <header className="topbar"><Link className="brand" href="/" aria-label="SID Bawangan beranda"><span className="brand-mark">B</span><span><strong>PEMERINTAH DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></Link><nav className="top-nav"><a href="#profil">Profil</a><a href="#informasi">Informasi</a><a className="admin-link" href="/admin/login">Masuk Admin <span>↗</span></a></nav></header>
    <section className="hero"><div className="hero-content"><p className="eyebrow"><span className="live-dot"/> PORTAL INFORMASI DESA</p><h1>Desa yang terbuka.<br/><span>Pelayanan yang dekat.</span></h1><p className="hero-copy">Selamat datang di portal informasi Pemerintah Desa Bawangan. Temukan kabar, pengumuman, dan informasi layanan masyarakat dalam satu tempat.</p><div className="hero-actions"><a className="primary-link" href="#informasi">Jelajahi informasi <span aria-hidden="true">↗</span></a><a className="hero-secondary" href="#profil">Mengenal desa <span aria-hidden="true">↓</span></a></div></div><div className="hero-art" aria-hidden="true"><div className="sun-disc"/><div className="hill hill-back"/><div className="hill hill-front"/><div className="village-line"><span/><span/><span/><span/><span/></div><div className="art-label"><span className="art-label-icon">⌂</span><span><b>Bawangan</b><small>Jombang, Jawa Timur</small></span></div></div><div className="hero-bottomline"><span>INFORMASI RESMI DESA</span><span>TERBUKA · TERHUBUNG · TERPERCAYA</span></div></section>
    <section className="quick-strip" aria-label="Kategori informasi">{[{n:'01',t:'Berita Desa',d:'Kabar dan kegiatan terkini'},{n:'02',t:'Pengumuman',d:'Informasi penting untuk warga'},{n:'03',t:'Layanan',d:'Panduan layanan administrasi'},{n:'04',t:'Profil Desa',d:'Mengenal Bawangan lebih dekat'}].map(x=><a href="#informasi" className="quick-item" key={x.n}><span>{x.n}</span><div><b>{x.t}</b><small>{x.d}</small></div><i>↗</i></a>)}</section>
    <section id="informasi" className="content-section"><div className="section-heading"><div><p className="eyebrow">KABAR & INFORMASI</p><h2>Yang perlu Anda ketahui.</h2><p className="section-copy">Informasi yang diterbitkan pengelola desa, bersumber dari satu sistem data.</p></div><span className="section-index">01 / INFORMASI</span></div>
      {latest&&<article className="featured-post"><div className="featured-art"><span className="featured-art-mark">B.</span><span className="featured-art-caption">BAWANGAN<br/>DALAM KABAR</span></div><div className="featured-copy"><span className="content-tag">{labels[latest.category]}</span><p className="post-date">{formatDate(latest.published_at)}</p><h3>{latest.title}</h3><p>{latest.summary||'Baca informasi lengkap yang diterbitkan oleh Pemerintah Desa Bawangan.'}</p><a href={'/informasi/'+latest.slug} className="text-link">Baca informasi <span>→</span></a></div></article>}
      <div className="post-grid">{posts.slice(latest?1:0).map(post=><article className="post-card" key={post.id}><div className="post-card-top"><span className="content-tag">{labels[post.category]}</span><span className="post-date">{formatDate(post.published_at)}</span></div><h3>{post.title}</h3><p>{post.summary||'Informasi resmi dari Pemerintah Desa Bawangan.'}</p><a className="text-link" href={'/informasi/'+post.slug}>Selengkapnya <span>→</span></a></article>)}</div>
      {loaded&&posts.length===0&&<div className="empty-public"><span className="empty-symbol">✳</span><h3>Informasi desa sedang disiapkan.</h3><p>Konten resmi akan ditampilkan di halaman ini setelah diterbitkan oleh pengelola desa.</p></div>}
      {!loaded&&<div className="loading-line">Memuat informasi terbaru…</div>}
    </section>
    <section id="profil" className="profile-band"><div><p className="eyebrow">TENTANG BAWANGAN</p><h2>Informasi lebih dekat,<br/>partisipasi lebih kuat.</h2></div><p>Portal ini dikembangkan untuk membantu masyarakat mengakses informasi desa secara lebih mudah. Data dan pengumuman resmi akan dipublikasikan oleh pengelola yang berwenang.</p><a href="/admin/login" className="profile-arrow" aria-label="Masuk panel pengelola">↗</a></section>
    <footer className="site-footer"><Link className="brand footer-brand" href="/"><span className="brand-mark">B</span><span><strong>DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></Link><p>© {new Date().getFullYear()} Pemerintah Desa Bawangan. Informasi resmi desa.</p><span className="footer-status"><i/> Portal informasi</span></footer>
  </main>;
}
