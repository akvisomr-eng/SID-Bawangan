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
6. Untuk akun berikutnya, buat pengguna melalui Auth. Setelah profil muncul, administrator dapat menetapkan peran melalui menu **Pengguna & Level Akses** di dashboard: `/admin/pengguna`.

## Pembagian kewenangan
- **viewer:** baca saja untuk meninjau konten dan modul; tidak dapat menyimpan perubahan.
- **editor:** membuat konten dan memperbarui draf; tidak dapat menerbitkan atau mengarsipkan konten terbit.
- **publisher:** meninjau, menerbitkan, dan mengarsipkan konten/modul; tidak mengelola peran pengguna.
- **admin:** pengelolaan penuh, termasuk pengaturan peran pengguna dan penghapusan modul sesuai kebijakan database.

Perubahan peran dilakukan lewat fungsi database yang memeriksa sesi dan peran admin. Admin tidak dapat mengubah perannya sendiri dari layar ini, dan admin terakhir tidak dapat diturunkan perannya. Pembuatan akun baru tetap dilakukan melalui Supabase Auth, bukan formulir pendaftaran publik.

Jangan membuat akun bersama. Setiap petugas sebaiknya memiliki akun masing-masing agar perubahan dapat ditelusuri.
