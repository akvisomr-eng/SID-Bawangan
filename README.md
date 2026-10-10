# Sistem Informasi Desa Bawangan (SID Bawangan)

Portal informasi publik dan panel administrasi untuk Pemerintah Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang.

## Teknologi
- Next.js App Router + TypeScript
- Supabase Auth dan PostgreSQL
- Row Level Security (RLS)
- GitHub Actions untuk build dan pemeriksaan tipe
- SID Editorial Agent v1: pemeriksaan konten deterministik tanpa pengiriman data ke layanan AI eksternal

## Modul saat ini
- Website publik responsif dengan feed berita, pengumuman, layanan, dan profil dari satu tabel konten.
- Halaman detail konten publik berdasarkan slug.
- Login admin melalui Supabase Auth.
- Ruang kerja untuk menyimpan draf, meninjau konten, dan menerbitkan/mengarsipkan sesuai hak akses database.
- Agen Editorial: skor dan temuan untuk kualitas judul/ringkasan, panjang isi, data sensitif, klaim yang perlu diverifikasi, dan konteks tanggal. Ini pemeriksaan berbasis aturan, bukan model bahasa generatif.
- Skema profiles dan posts, trigger timestamp, indeks feed, peran admin/editor/publisher, serta RLS.

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

## Skema database
Migrasi sumber: supabase/migrations/202610100001_initial_schema.sql.
