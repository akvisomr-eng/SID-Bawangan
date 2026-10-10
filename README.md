# Sistem Informasi Desa Bawangan (SID Bawangan)

Fondasi aplikasi website publik dan panel administrasi untuk Pemerintah Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang.

## Status

Repositori proyek telah disiapkan. Implementasi aplikasi, koneksi Supabase, pengujian, dan deployment dilakukan bertahap dan belum boleh dianggap selesai sebelum diverifikasi.

## Prinsip teknis

- Next.js + TypeScript untuk antarmuka responsif.
- Supabase/PostgreSQL untuk data dan autentikasi.
- Role-based access control dan Row Level Security (RLS).
- Data publik hanya menampilkan konten yang telah dipublikasikan.
- Rahasia disimpan di environment variables, tidak di-commit.

## Tahapan

1. Inisialisasi aplikasi dan skema database.
2. Hubungkan Supabase Auth dan RLS.
3. Implementasikan pengelolaan konten dan halaman publik dari basis data yang sama.
4. Build, uji keamanan/fungsi, dan perbaiki temuan.
5. Deploy setelah pengujian dan persetujuan.

## Anggaran acuan

Rp35.347.800 termasuk pajak sebagai batas perencanaan; status pajak dan rincian final perlu diverifikasi terpisah.
