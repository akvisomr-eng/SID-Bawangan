-- SID Bawangan: structured, draft-first content modules for all public navigation areas.
create table if not exists public.portal_modules (
  id uuid primary key default gen_random_uuid(),
  module_key text not null unique check (module_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 180),
  category text not null check (category in ('profil','data_desa','layanan','transparansi','ppid','dokumen','sosial','agenda','anti_korupsi')),
  summary text not null default '' check (char_length(summary) <= 800),
  body text not null default '',
  data jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  display_order integer not null default 100,
  published_at timestamptz,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_portal_modules_have_date check (status <> 'published' or published_at is not null)
);
create index if not exists portal_modules_public_feed_idx on public.portal_modules(category, display_order, title) where status = 'published';
drop trigger if exists portal_modules_set_updated_at on public.portal_modules;
create trigger portal_modules_set_updated_at before update on public.portal_modules for each row execute function public.set_updated_at();
alter table public.portal_modules enable row level security;
revoke all on public.portal_modules from anon, authenticated;
grant select on public.portal_modules to anon, authenticated;
grant insert, update, delete on public.portal_modules to authenticated;
create policy "Published portal modules are publicly readable" on public.portal_modules for select to anon, authenticated using (status = 'published');
create policy "Staff can read portal modules" on public.portal_modules for select to authenticated using ((select public.current_user_role()) in ('admin','editor','publisher'));
create policy "Staff can create portal module drafts" on public.portal_modules for insert to authenticated with check ((select public.current_user_role()) in ('admin','editor','publisher') and (updated_by is null or updated_by = (select auth.uid())) and status = 'draft');
create policy "Staff update portal module drafts; publishers manage publication" on public.portal_modules for update to authenticated
using ((select public.current_user_role()) in ('admin','publisher') or ((select public.current_user_role()) = 'editor' and status = 'draft'))
with check ((select public.current_user_role()) in ('admin','publisher') or ((select public.current_user_role()) = 'editor' and status = 'draft'));
create policy "Admins can delete portal modules" on public.portal_modules for delete to authenticated using ((select public.current_user_role()) = 'admin');
comment on table public.portal_modules is 'Modul konten SID Bawangan yang disiapkan untuk diisi; hanya status published yang dapat dibaca publik.';
insert into public.portal_modules (module_key,title,category,summary,data,status,display_order) values
('profil-desa','Profil Desa','profil','Identitas resmi, sejarah, visi, misi, dan potensi Desa Bawangan.', '{"alamat":"","telepon":"","email":"","luas_wilayah":"","visi":"","misi":[],"sejarah":"","potensi":[]}'::jsonb,'draft',10),
('struktur-pemerintahan','Struktur Pemerintahan','profil','Daftar perangkat, jabatan, masa tugas, dan foto resmi.', '{"pejabat":[]}'::jsonb,'draft',20),
('wilayah-desa','Data Wilayah dan Peta','data_desa','Luas, batas wilayah, dusun, RT/RW, peta dan sumber data resmi.', '{"luas":"","satuan_luas":"km²","batas_utara":"","batas_selatan":"","batas_timur":"","batas_barat":"","dusun":[],"rt_rw":"","peta_url":"","sumber":"","tanggal_verifikasi":""}'::jsonb,'draft',30),
('statistik-penduduk','Statistik Desa','data_desa','Ringkasan demografi agregat tanpa membuka data individu.', '{"periode":"","jumlah_penduduk":null,"laki_laki":null,"perempuan":null,"jumlah_kk":null,"jumlah_dusun":null,"jumlah_rt":null,"jumlah_rw":null,"sumber":"","tanggal_verifikasi":""}'::jsonb,'draft',40),
('pendidikan-dalam-kk','Pendidikan dalam KK','data_desa','Komponen statistik pendidikan keluarga secara agregat.', '{"periode":"","kategori":[],"sumber":"","tanggal_verifikasi":""}'::jsonb,'draft',50),
('pendidikan-ditempuh','Pendidikan Ditempuh','data_desa','Sebaran pendidikan warga berdasarkan data terverifikasi.', '{"periode":"","kategori":[],"sumber":"","tanggal_verifikasi":""}'::jsonb,'draft',60),
('data-pekerjaan','Data Pekerjaan','data_desa','Ringkasan mata pencaharian warga dan potensi ekonomi.', '{"periode":"","kategori":[],"sumber":"","tanggal_verifikasi":""}'::jsonb,'draft',70),
('data-agama','Data Agama','data_desa','Statistik agregat yang sah dan layak dipublikasikan.', '{"periode":"","kategori":[],"sumber":"","tanggal_verifikasi":""}'::jsonb,'draft',80),
('data-sosial','Data Sosial','data_desa','Indikator sosial agregat dengan perlindungan data pribadi.', '{"periode":"","indikator":[],"sumber":"","tanggal_verifikasi":""}'::jsonb,'draft',90),
('idm-sdgs','IDM dan SDGs Desa','data_desa','Indeks Desa Membangun dan indikator SDGs sesuai dokumen resmi.', '{"periode":"","idm":"","status_idm":"","sdgs":[],"sumber":"","dokumen_url":""}'::jsonb,'draft',100),
('rpjm-desa','RPJM Desa','transparansi','Dokumen rencana pembangunan jangka menengah desa.', '{"tahun_awal":"","tahun_akhir":"","nomor_penetapan":"","tanggal_penetapan":"","dokumen_url":"","ringkasan_prioritas":[]}'::jsonb,'draft',110),
('rkp-desa','RKP Desa','transparansi','Rencana kerja pemerintah desa per tahun.', '{"tahun":"","nomor_penetapan":"","tanggal_penetapan":"","dokumen_url":"","prioritas":[]}'::jsonb,'draft',120),
('apbdes-realisasi','APBDes dan Realisasi','transparansi','Anggaran, perubahan, dan realisasi dari dokumen yang disahkan.', '{"tahun":"","pendapatan":null,"belanja":null,"pembiayaan":null,"realisasi_pendapatan":null,"realisasi_belanja":null,"dokumen_apbdes_url":"","dokumen_realisasi_url":"","tanggal_verifikasi":""}'::jsonb,'draft',130),
('produk-hukum','Produk Hukum','transparansi','Peraturan desa, peraturan kepala desa, dan keputusan.', '{"dokumen":[]}'::jsonb,'draft',140),
('laporan-pembangunan','Laporan Pembangunan','transparansi','Daftar kegiatan, lokasi, anggaran dokumen, kemajuan, dan foto.', '{"kegiatan":[]}'::jsonb,'draft',150),
('ppid-informasi-publik','PPID Desa','ppid','Daftar informasi publik, SOP, maklumat, alur permohonan, dan keberatan.', '{"pejabat_ppid":"","kontak":"","alamat":"","sop_url":"","maklumat_url":"","alur_permohonan":[],"alur_keberatan":[],"daftar_informasi":[],"jam_layanan":"","tanggal_verifikasi":""}'::jsonb,'draft',160),
('dokumen-publik','Pusat Dokumen Desa','dokumen','Pusat dokumen yang diterima, diperiksa, diklasifikasi, dan disetujui untuk publikasi.', '{"dokumen":[]}'::jsonb,'draft',170),
('standar-pelayanan','Standar Pelayanan Publik','layanan','Persyaratan, prosedur, durasi, biaya resmi, formulir, dan dasar hukum.', '{"layanan":[]}'::jsonb,'draft',180),
('agenda-pengumuman','Agenda dan Pengumuman','agenda','Kalender kegiatan, musyawarah, jadwal layanan, dan pengumuman resmi.', '{"agenda":[]}'::jsonb,'draft',190),
('jaring-pengaman-sosial','Jaring Pengaman Sosial','sosial','Informasi program sosial tanpa mempublikasikan data pribadi penerima.', '{"program":[],"kontak_pendamping":"","syarat_umum":"","sumber":"","tanggal_verifikasi":""}'::jsonb,'draft',200),
('pasar-umkm','Pasar Desa dan UMKM','layanan','Direktori produk lokal dan informasi usaha setelah persetujuan pemilik.', '{"usaha":[]}'::jsonb,'draft',210),
('ambulans-desa','Informasi Ambulans Desa','layanan','Kontak, jam layanan, prosedur, cakupan, dan ketentuan penggunaan.', '{"kontak":"","jam_layanan":"","cakupan":"","prosedur":"","biaya_resmi":"","penanggung_jawab":""}'::jsonb,'draft',220),
('aspirasi-pengaduan','Aspirasi dan Pengaduan','layanan','Kanal masukan dengan SOP, penanggung jawab, dan alur tindak lanjut.', '{"kanal":"","kontak":"","sop_url":"","target_waktu_respons":"","penanggung_jawab":"","privasi":""}'::jsonb,'draft',230),
('komunitas-digital','Komunitas Digital Desa','layanan','Informasi kelompok warga dan agenda partisipasi.', '{"komunitas":[]}'::jsonb,'draft',240),
('klinik-umkm','Klinik UMKM','layanan','Jadwal konsultasi, pelatihan, dan dukungan pelaku usaha.', '{"program":[],"kontak":"","jadwal":"","lokasi":""}'::jsonb,'draft',250),
('posyantek','Posyantek','layanan','Informasi pos pelayanan teknologi tepat guna jika ditetapkan.', '{"status_program":"","kontak":"","layanan":[],"jadwal":"","lokasi":""}'::jsonb,'draft',260),
('wifi-publik','Wi-Fi Publik','layanan','Titik akses, ketentuan, cakupan, dan kontak penanggung jawab.', '{"titik_akses":[],"ketentuan":"","kontak":"","status_operasional":""}'::jsonb,'draft',270),
('perpustakaan-desa','Perpustakaan Desa','layanan','Koleksi, jam buka, lokasi, tata tertib, dan layanan literasi.', '{"alamat":"","jam_buka":"","koleksi":[],"tata_tertib":"","kontak":""}'::jsonb,'draft',280),
('desa-anti-korupsi','Desa Anti Korupsi','anti_korupsi','Dokumentasi tata laksana, pengawasan, pelayanan, partisipasi, dan kearifan lokal.', '{"tata_laksana":[],"pengawasan":[],"pelayanan_publik":[],"partisipasi":[],"kearifan_lokal":[],"kanal_pengaduan":"","dokumen_pendukung":[]}'::jsonb,'draft',290)
on conflict (module_key) do nothing;
