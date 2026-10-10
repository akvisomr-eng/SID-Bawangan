# AI Companion Desa Bawangan

## Tujuan
Widget AI Companion tampil pada seluruh halaman publik dan panel yang memakai root layout. Fase pertama membantu pertanyaan publik melalui chat, input suara browser, dan pembacaan jawaban. Jawaban harus bersumber dari konten publik berstatus `published`.

## Komponen
- `src/components/ai-companion.tsx`: widget chat/voice, logo huruf B yang mengikuti brand-mark saat ini, status mendengarkan/berpikir/berbicara.
- `supabase/functions/ai-companion/index.ts`: Edge Function untuk mengambil konten publik, menyusun konteks, dan memanggil penyedia model.
- `supabase/sql/ai_companion_learning.sql`: tabel sinyal peningkatan layanan dengan RLS ketat dan pencatatan pertanyaan hanya setelah persetujuan eksplisit.

## Konfigurasi Edge Function
Fungsi ini dipublikasikan tanpa JWT gateway agar pengunjung website tidak diwajibkan login. Karena itu fungsi hanya boleh membaca konten berstatus published, tidak boleh menerima perintah tulis, dan harus memiliki pembatasan biaya/permintaan. Fungsi saat ini memiliki pembatas sederhana per-instance; tambahkan rate limit durable di gateway/provider sebelum promosi luas. Origin default dibatasi ke `https://akvisomr-eng.github.io`; set `ALLOWED_ORIGIN` jika domain produksi berubah.\n\nKonfigurasikan secrets berikut di Supabase, bukan di frontend:
- `OPENAI_API_KEY` — wajib; jangan pernah memakai awalan NEXT_PUBLIC.
- `OPENAI_MODEL` — opsional, default `gpt-4o-mini`.
- `SUPABASE_SERVICE_ROLE_KEY` — opsional untuk pencatatan pertanyaan yang disetujui; hanya untuk Edge Function.
- `ALLOWED_ORIGIN` — opsional, batasi ke origin website produksi.

Supabase menyediakan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di runtime Edge Function. Frontend menggunakan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` saat build GitHub Pages.

## Aktivasi
1. Jalankan SQL dari `supabase/sql/ai_companion_learning.sql` di SQL Editor pada proyek Supabase SID Bawangan.
2. Deploy folder `supabase/functions/ai-companion` dengan Supabase CLI atau Dashboard.
3. Tambahkan secrets yang dibutuhkan dan batasi origin. Tanpa `OPENAI_API_KEY`, fungsi aktif tetapi akan mengembalikan status layanan belum dikonfigurasi.
4. Pastikan tabel `posts` dan `portal_modules` hanya mengembalikan konten publik yang telah dipublikasikan untuk kunci anon.
5. Build dan uji GitHub Pages: chat, sumber jawaban, mikrofon dengan izin pengguna, pembacaan suara, tampilan mobile, dan kegagalan provider.
6. Tetapkan kebijakan retensi dan proses penghapusan untuk event pembelajaran sebelum mengaktifkan pengumpulan pertanyaan.

## Pembelajaran aman
- Secara default pertanyaan tidak disimpan sebagai riwayat pelatihan.
- Jika warga mencentang persetujuan untuk satu pertanyaan, fungsi menyimpan teks yang disamarkan dari pola email, nomor telepon, dan angka 16 digit.
- Penyaringan pola bukan jaminan anonimisasi sempurna. Jangan mendorong warga mengirim data sensitif; buat kebijakan retensi, akses petugas, dan penghapusan sebelum peluncuran.
- Transaksi layanan hanya boleh menghasilkan sinyal minimal seperti kategori dan status proses. Jangan kirim data identitas, isi dokumen, atau detail transaksi ke model tanpa kebutuhan, dasar, dan kontrol akses yang disetujui.
- Peningkatan kemampuan pada fase awal berarti memperbaiki basis pengetahuan dan evaluasi berdasarkan pola/umpan balik; bukan model yang melatih dirinya sendiri secara otomatis.
