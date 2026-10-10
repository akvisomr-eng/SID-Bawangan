# Sistem Informasi Desa Bawangan (SID Bawangan)

Portal informasi publik dan panel administrasi untuk Pemerintah Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang.

## Teknologi
- Next.js App Router + TypeScript
- Supabase Auth dan PostgreSQL
- Row Level Security (RLS)
- GitHub Actions untuk build, pemeriksaan tipe, audit dependensi, dan publikasi statis gratis melalui GitHub Pages
- SID Editorial Agent v1: pemeriksaan konten deterministik tanpa pengiriman data ke layanan AI eksternal

## Modul saat ini
- Website publik responsif dengan feed berita, pengumuman, layanan, dan profil dari satu tabel konten.
- Halaman detail konten publik berdasarkan slug.
- Login admin melalui Supabase Auth.
- Ruang kerja untuk menyimpan draf, meninjau konten, dan menerbitkan/mengarsipkan sesuai hak akses database.
- Agen Editorial: skor dan temuan untuk kualitas judul/ringkasan, panjang isi, data sensitif, klaim yang perlu diverifikasi, dan konteks tanggal. Ini pemeriksaan berbasis aturan, bukan model bahasa generatif.
- Skema profiles, posts, dan portal_modules dengan 29 kerangka modul yang mencakup sembilan kategori menu: profil, data desa, layanan, transparansi, PPID, dokumen, sosial, agenda, dan antikorupsi.
- Workspace modul di `/admin/modul`: isi ringkasan, narasi, data terstruktur JSON, simpan draf, dan publikasikan dengan peran yang sesuai.
- Modul publik yang diterbitkan dibaca langsung dari Supabase dan ditampilkan pada bagian Informasi dan Modul Desa; semua modul baru berstatus draf sampai diverifikasi.

## Deployment gratis
- Workflow `.github/workflows/deploy-pages.yml` membangun keluaran statis Next.js dan menerbitkannya ke GitHub Pages tanpa Render atau layanan hosting berbayar.
- URL proyek yang ditargetkan: `https://akvisomr-eng.github.io/SID-Bawangan/`.
- Jika publikasi pertama belum berjalan, buka Settings → Pages di repository GitHub dan pilih `GitHub Actions` sebagai Build and deployment source; lalu jalankan workflow `SID Bawangan Free Deployment`.
- Website publik dan panel login memakai Supabase browser client. Jangan memasukkan service-role key atau secret server ke workflow; hanya publishable key yang boleh digunakan pada browser.
- Karena GitHub Pages hanya menyajikan file statis, konten dibaca langsung dari Supabase. Perubahan konten muncul tanpa rebuild; halaman detail memakai parameter `?slug=` agar tetap kompatibel dengan hosting statis.

## Menjalankan lokal
1. Gunakan Node.js 20 atau yang lebih baru.
2. Salin .env.example menjadi .env.local.
3. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY dengan URL dan publishable key proyek Supabase SID Bawangan.
4. Jalankan npm install, lalu npm run dev.
5. Jalankan npm run build dan npx tsc --noEmit sebelum deployment.

Jangan pernah menaruh service_role key, password database, token akses, atau secret lain dalam NEXT_PUBLIC_*, repositori, atau kode browser.

## Penyiapan admin awal
- Buat akun staf melalui Supabase Auth dengan metode undangan/admin tepercaya; jangan menambahkan pendaftaran publik.
- Trigger membuat profil baru dengan peran paling rendah editor.
- Tetapkan peran awal admin melalui jalur SQL tepercaya/console Supabase setelah memverifikasi UUID akun yang benar. Jangan membuka pembaruan kolom role kepada pengguna aplikasi.
- Uji login, penyimpanan draf, penerbitan oleh publisher/admin, serta akses publik terhadap draf sebelum go-live.

## Keamanan dan batasan
- Pengunjung publik hanya boleh membaca konten berstatus published.
- Editor dapat membuat dan memperbarui draf; publisher dapat menerbitkan; admin dapat mengarsipkan dan menghapus.
- Peran baru otomatis editor; kenaikan peran hanya oleh operator tepercaya.
- Periksa Supabase Security Advisor dan jalankan pengujian akses negatif sebelum go-live.
- Agen Editorial hanya pemeriksaan dasar; manusia tetap bertanggung jawab atas fakta, data pribadi, dan persetujuan publikasi.
- Kontak, statistik, profil, jam layanan, alamat, dan data resmi lain tidak boleh diisi dengan perkiraan.
- Domain, hosting, akun staf, backup, serta UAT produksi masih perlu disiapkan dan diverifikasi.

## Panduan operasional
- Pengisian dan publikasi modul: `docs/PANDUAN_PENGISIAN_MODUL.md`.
- Pembuatan akun admin pertama: `docs/PENYIAPAN_AKUN_ADMIN.md`.

## Skema database
Migrasi sumber berada di `supabase/migrations/`: skema awal konten/peran, modul portal terstruktur, dan penyempurnaan kebijakan RLS serta indeks.
