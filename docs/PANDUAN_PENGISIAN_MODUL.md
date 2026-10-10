# Panduan Pengisian Modul SID Bawangan

## Alur kerja
1. Masuk ke `/admin/login` menggunakan akun resmi yang telah dibuat di Supabase Auth.
2. Buka **Kelola semua modul website** atau langsung ke `/admin/modul`.
3. Pilih modul dari daftar kiri.
4. Lengkapi judul, ringkasan, isi informasi, dan **Data terstruktur (JSON)** sesuai cetakan modul.
5. Simpan sebagai draf untuk pemeriksaan. Hanya akun berperan `publisher` atau `admin` yang dapat menerbitkan modul.
6. Setelah diterbitkan, modul akan ditampilkan pada bagian **Informasi dan Modul Desa** di website publik. Konten artikel berita tetap dikelola melalui editor konten yang sudah tersedia.

## Modul yang telah disiapkan
- **Profil:** Profil Desa; Struktur Pemerintahan.
- **Data desa:** Data Wilayah dan Peta; Statistik Desa; Pendidikan dalam KK; Pendidikan Ditempuh; Data Pekerjaan; Data Agama; Data Sosial; IDM dan SDGs Desa.
- **Transparansi:** RPJM Desa; RKP Desa; APBDes dan Realisasi; Produk Hukum; Laporan Pembangunan.
- **PPID dan dokumen:** PPID Desa; Pusat Dokumen Desa.
- **Layanan warga:** Standar Pelayanan Publik; Pasar Desa dan UMKM; Informasi Ambulans Desa; Aspirasi dan Pengaduan; Komunitas Digital Desa; Klinik UMKM; Posyantek; Wi-Fi Publik; Perpustakaan Desa.
- **Agenda dan sosial:** Agenda dan Pengumuman; Jaring Pengaman Sosial.
- **Integritas:** Desa Anti Korupsi (tata laksana, pengawasan, pelayanan publik, partisipasi, kearifan lokal, kanal pengaduan, dan dokumen pendukung).

## Aturan data
- Jangan mengisi angka demografi, anggaran, luas wilayah, atau capaian program dengan perkiraan.
- Catat periode, sumber dokumen, tanggal verifikasi, nomor/tanggal penetapan jika relevan.
- Untuk dokumen, masukkan tautan yang dapat diakses publik hanya setelah file disetujui untuk dipublikasikan.
- Jangan mempublikasikan NIK, nomor KK, alamat rumah pribadi, nomor rekening, tanda tangan, kredensial, atau daftar penerima bantuan.
- Statistik keluarga, pendidikan, pekerjaan, agama, dan bantuan sosial ditampilkan dalam bentuk agregat yang aman.
- Gunakan `[]` untuk daftar kosong, `{}` untuk objek kosong, `null` hanya untuk angka/nilai yang belum diketahui. Teks JSON wajib memakai tanda kutip ganda.
- Modul yang masih berupa draf tidak dapat dibaca oleh pengunjung. Periksa kembali tampilan setelah diterbitkan.

## Status awal
Semua modul dimulai sebagai **Draf**. Status ini sengaja dipertahankan sampai data resmi diterima, diverifikasi, dan disetujui oleh Pemerintah Desa Bawangan. Kerangka modul tidak berarti layanan eksternal seperti transaksi pasar, ambulans, pengaduan, atau permohonan PPID telah aktif secara operasional.
