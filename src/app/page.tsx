const menu = ['Profil Desa', 'Berita', 'Pengumuman', 'Informasi Layanan'];

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="SID Bawangan beranda"><span className="brand-mark">B</span><span><strong>DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></a>
        <a className="admin-link" href="/admin/login">Masuk Admin</a>
      </header>
      <section className="hero">
        <p className="eyebrow">SISTEM INFORMASI DESA</p>
        <h1>Selamat datang di<br/><span>Desa Bawangan</span></h1>
        <p className="hero-copy">Pusat informasi desa untuk berita, pengumuman, profil, dan informasi layanan masyarakat.</p>
        <a className="primary-link" href="#informasi">Jelajahi Informasi <span aria-hidden="true">→</span></a>
        <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
      </section>
      <section id="informasi" className="content-section">
        <p className="eyebrow">INFORMASI DESA</p><h2>Informasi dalam satu tempat</h2>
        <p className="section-copy">Konten resmi akan ditampilkan setelah sumber data dan publikasi admin terhubung.</p>
        <div className="info-grid">{menu.map((item, index) => <article className="info-card" key={item}><span className="card-number">0{index + 1}</span><h3>{item}</h3><p>Informasi {item.toLowerCase()} akan tersedia di sini setelah modul terkait diterapkan.</p><span className="card-arrow" aria-hidden="true">↗</span></article>)}</div>
      </section>
      <footer><span>© {new Date().getFullYear()} Pemerintah Desa Bawangan</span><span>SID Bawangan · Versi fondasi</span></footer>
    </main>
  );
}
