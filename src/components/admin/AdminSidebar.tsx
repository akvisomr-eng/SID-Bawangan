'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const groups = [
  { title: 'RINGKASAN', items: [
    { label: 'Dashboard', icon: '▦', href: '/admin', exact: true },
  ]},
  { title: 'KONTEN WEBSITE', items: [
    { label: 'Berita & Pengumuman', icon: '▤', href: '/admin#content-editor' },
    { label: 'Daftar Konten', icon: '☷', href: '/admin#posts-list' },
    { label: 'Semua Modul Website', icon: '▧', href: '/admin/modul' },
  ]},
  { title: 'PROFIL & DATA DESA', items: [
    { label: 'Profil Desa', icon: '⌂', href: '/admin/modul?module=profil-desa' },
    { label: 'Pemerintahan Desa', icon: '♙', href: '/admin/modul?module=struktur-pemerintahan' },
    { label: 'Wilayah Desa', icon: '⌖', href: '/admin/modul?module=wilayah-desa' },
    { label: 'Statistik Desa', icon: '▥', href: '/admin/modul?module=statistik-penduduk' },
    { label: 'Data Penduduk', icon: '♧', href: '/admin/modul?module=statistik-penduduk' },
    { label: 'Pendidikan dalam KK', icon: '▣', href: '/admin/modul?module=pendidikan-dalam-kk' },
    { label: 'Pendidikan Ditempuh', icon: '▣', href: '/admin/modul?module=pendidikan-ditempuh' },
    { label: 'Data Pekerjaan', icon: '▤', href: '/admin/modul?module=data-pekerjaan' },
    { label: 'Data Agama & Sosial', icon: '♡', href: '/admin/modul?module=data-sosial' },
    { label: 'IDM & SDGs Desa', icon: '◉', href: '/admin/modul?module=idm-sdgs' },
  ]},
  { title: 'LAYANAN & TRANSPARANSI', items: [
    { label: 'Standar Pelayanan', icon: '✓', href: '/admin/modul?module=standar-pelayanan' },
    { label: 'Agenda & Pengumuman', icon: '◷', href: '/admin/modul?module=agenda-pengumuman' },
    { label: 'PPID Desa', icon: '▤', href: '/admin/modul?module=ppid-informasi-publik' },
    { label: 'Dokumen Publik', icon: '▧', href: '/admin/modul?module=dokumen-publik' },
    { label: 'Produk Hukum', icon: '§', href: '/admin/modul?module=produk-hukum' },
    { label: 'RPJM Desa', icon: '▥', href: '/admin/modul?module=rpjm-desa' },
    { label: 'RKP Desa', icon: '▥', href: '/admin/modul?module=rkp-desa' },
    { label: 'APBDes & Realisasi', icon: '◈', href: '/admin/modul?module=apbdes-realisasi' },
    { label: 'Laporan Pembangunan', icon: '⌁', href: '/admin/modul?module=laporan-pembangunan' },
  ]},
  { title: 'PROGRAM & PARTISIPASI', items: [
    { label: 'Jaring Pengaman Sosial', icon: '♡', href: '/admin/modul?module=jaring-pengaman-sosial' },
    { label: 'Pasar UMKM', icon: '⌂', href: '/admin/modul?module=pasar-umkm' },
    { label: 'Klinik UMKM', icon: '✚', href: '/admin/modul?module=klinik-umkm' },
    { label: 'Ambulans Desa', icon: '✚', href: '/admin/modul?module=ambulans-desa' },
    { label: 'Aspirasi & Pengaduan', icon: '✉', href: '/admin/modul?module=aspirasi-pengaduan' },
    { label: 'Komunitas Digital', icon: '⌘', href: '/admin/modul?module=komunitas-digital' },
    { label: 'Posyantek', icon: '⚙', href: '/admin/modul?module=posyantek' },
    { label: 'Wi-Fi Publik', icon: '⌁', href: '/admin/modul?module=wifi-publik' },
    { label: 'Perpustakaan Desa', icon: '▣', href: '/admin/modul?module=perpustakaan-desa' },
    { label: 'Desa Anti Korupsi', icon: '✓', href: '/admin/modul?module=desa-anti-korupsi' },
  ]},
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return <aside className="sid-admin-sidebar">
    <Link href="/admin" className="sid-admin-brand">
      <span className="sid-admin-brand-mark">B</span>
      <span><strong>BAWANGAN</strong><small>SID · Panel Administrasi</small></span>
    </Link>
    <div className="sid-admin-side-scroll">
      {groups.map((group) => <section className="sid-admin-nav-group" key={group.title}>
        <p>{group.title}</p>
        {group.items.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : item.href.startsWith('/admin/modul') ? pathname.startsWith('/admin/modul') && (item.href === '/admin/modul' || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('module') === item.href.split('module=')[1])) : pathname === '/admin' && item.href.includes('#');
          return <Link key={item.label} href={item.href} className={'sid-admin-nav-link' + (active ? ' active' : '')} aria-current={active ? 'page' : undefined}><span className="sid-admin-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></Link>;
        })}
      </section>)}
    </div>
    <div className="sid-admin-sidebar-bottom"><span className="sid-admin-live-dot" /><span><strong>SID Bawangan</strong><small>Portal layanan desa</small></span><Link href="/" title="Lihat website publik" aria-label="Lihat website publik">↗</Link></div>
  </aside>;
}
