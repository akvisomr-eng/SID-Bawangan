# Menyiapkan akun pengelola pertama

Akun dibuat melalui Supabase Auth; pendaftaran publik tidak diaktifkan. Jangan menyimpan kata sandi atau service-role/secret key di repositori.

1. Buka [Supabase Authentication Users](https://supabase.com/dashboard/project/iacagsauvncvowpotdfy/auth/users).
2. Tambahkan akun resmi pengelola dengan email yang disetujui pemerintah desa. Gunakan kata sandi kuat dan distribusikan melalui jalur aman.
3. Buka SQL Editor. Cari UUID akun yang baru dibuat:

```sql
select id, email, created_at
from auth.users
order by created_at desc;
```

4. Pastikan email/UUID benar, lalu tetapkan akun pertama sebagai admin (ganti UUID dengan nilai hasil query):

```sql
update public.profiles
set role = 'admin',
    full_name = 'Administrator SID Bawangan',
    updated_at = now()
where id = 'GANTI-DENGAN-UUID-AKUN'::uuid;
```

5. Pastikan tepat satu profil berubah. Keluar lalu masuk kembali melalui `/admin/login` agar sesi dan peran dibaca ulang.
6. Untuk akun berikutnya, buat pengguna melalui Auth lalu tetapkan peran yang sesuai (`editor`, `publisher`, atau `admin`) dengan persetujuan pemilik sistem.

## Pembagian kewenangan
- **editor:** menyiapkan dan menyimpan draf.
- **publisher:** memeriksa dan menerbitkan konten/modul.
- **admin:** kewenangan pengelolaan penuh, termasuk menghapus modul sesuai kebijakan database.

Jangan membuat akun bersama. Setiap petugas sebaiknya memiliki akun masing-masing agar perubahan dapat ditelusuri.
