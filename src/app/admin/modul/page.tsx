'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Json } from '@/lib/supabase/database.types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import AdminSidebar from '@/components/admin/AdminSidebar';

type PortalModule = {
  id: string; module_key: string; title: string; category: string; summary: string;
  body: string; data: Json; status: 'draft' | 'published' | 'archived';
  display_order: number; published_at: string | null; updated_at: string;
};
const categoryLabels: Record<string, string> = {
  profil: 'Profil desa', data_desa: 'Data desa', layanan: 'Layanan warga',
  transparansi: 'Transparansi', ppid: 'PPID', dokumen: 'Dokumen publik',
  sosial: 'Jaring pengaman sosial', agenda: 'Agenda', anti_korupsi: 'Desa anti korupsi',
};
const prettyStatus: Record<string, string> = { draft: 'Draf', published: 'Terbit', archived: 'Arsip' };
type ModuleField = { key: string; label: string; type?: 'text' | 'number' | 'date' | 'url' | 'textarea'; placeholder?: string; help?: string };
const commonFields: ModuleField[] = [{ key: 'keterangan', label: 'Keterangan tambahan', type: 'textarea', placeholder: 'Informasi pendukung yang sudah diverifikasi' }];
const moduleFields: Record<string, ModuleField[]> = {
  'profil-desa': [
    { key: 'nama_desa', label: 'Nama desa', placeholder: 'Desa Bawangan' },
    { key: 'kecamatan', label: 'Kecamatan', placeholder: 'Ploso' },
    { key: 'kabupaten', label: 'Kabupaten', placeholder: 'Jombang' },
    { key: 'provinsi', label: 'Provinsi', placeholder: 'Jawa Timur' },
    { key: 'kode_pos', label: 'Kode pos', placeholder: '61453' },
    { key: 'alamat_kantor', label: 'Alamat kantor desa', type: 'textarea' },
    { key: 'telepon', label: 'Telepon resmi' },
    { key: 'email', label: 'Email resmi', type: 'text' },
    { key: 'website', label: 'Website resmi', type: 'url' },
    { key: 'sejarah', label: 'Sejarah desa', type: 'textarea' },
    { key: 'visi', label: 'Visi desa', type: 'textarea' },
    { key: 'misi', label: 'Misi desa', type: 'textarea', help: 'Satu poin per baris.' },
  ],
  'struktur-pemerintahan': [
    { key: 'kepala_desa', label: 'Nama kepala desa' },
    { key: 'masa_jabatan', label: 'Masa jabatan', placeholder: 'Contoh: 2020–2028' },
    { key: 'sekretaris_desa', label: 'Sekretaris desa' },
    { key: 'kaur', label: 'Kepala urusan', type: 'textarea', help: 'Nama dan jabatan, satu orang per baris.' },
    { key: 'kasi', label: 'Kepala seksi', type: 'textarea', help: 'Nama dan jabatan, satu orang per baris.' },
    { key: 'kepala_dusun', label: 'Kepala dusun', type: 'textarea', help: 'Nama dusun dan kepala dusun, satu per baris.' },
    { key: 'bpd', label: 'Badan Permusyawaratan Desa (BPD)', type: 'textarea' },
    { key: 'lembaga_desa', label: 'Lembaga desa lainnya', type: 'textarea' },
  ],
  'wilayah-desa': [
    { key: 'luas_wilayah', label: 'Luas wilayah', placeholder: 'Angka dan satuan; verifikasi sebelum publikasi' },
    { key: 'jumlah_dusun', label: 'Jumlah dusun', type: 'number' },
    { key: 'jumlah_rw', label: 'Jumlah RW', type: 'number' },
    { key: 'jumlah_rt', label: 'Jumlah RT', type: 'number' },
    { key: 'batas_utara', label: 'Batas utara' },
    { key: 'batas_selatan', label: 'Batas selatan' },
    { key: 'batas_timur', label: 'Batas timur' },
    { key: 'batas_barat', label: 'Batas barat' },
    { key: 'koordinat', label: 'Koordinat kantor desa', placeholder: 'Lintang, bujur' },
    { key: 'akses_transportasi', label: 'Akses dan kondisi wilayah', type: 'textarea' },
  ],
  'statistik-penduduk': [
    { key: 'tahun_data', label: 'Tahun data', type: 'number' },
    { key: 'jumlah_penduduk', label: 'Jumlah penduduk', type: 'number' },
    { key: 'jumlah_laki_laki', label: 'Penduduk laki-laki', type: 'number' },
    { key: 'jumlah_perempuan', label: 'Penduduk perempuan', type: 'number' },
    { key: 'jumlah_kk', label: 'Jumlah kepala keluarga (KK)', type: 'number' },
    { key: 'jumlah_jiwa', label: 'Jumlah jiwa', type: 'number' },
    { key: 'sumber_data', label: 'Sumber dan tanggal pemutakhiran', type: 'textarea' },
  ],
  'pendidikan-dalam-kk': [
    { key: 'tahun_data', label: 'Tahun data', type: 'number' },
    { key: 'tidak_sekolah', label: 'Tidak/belum sekolah', type: 'number' },
    { key: 'sd', label: 'SD/sederajat', type: 'number' },
    { key: 'smp', label: 'SMP/sederajat', type: 'number' },
    { key: 'sma', label: 'SMA/SMK/sederajat', type: 'number' },
    { key: 'diploma', label: 'Diploma', type: 'number' },
    { key: 'sarjana', label: 'Sarjana dan pascasarjana', type: 'number' },
    { key: 'sumber_data', label: 'Sumber data', type: 'textarea' },
  ],
  'pendidikan-ditempuh': [
    { key: 'tahun_data', label: 'Tahun data', type: 'number' },
    { key: 'paud_tk', label: 'PAUD/TK', type: 'number' },
    { key: 'sd', label: 'SD/sederajat', type: 'number' },
    { key: 'smp', label: 'SMP/sederajat', type: 'number' },
    { key: 'sma', label: 'SMA/SMK/sederajat', type: 'number' },
    { key: 'perguruan_tinggi', label: 'Perguruan tinggi', type: 'number' },
    { key: 'putus_sekolah', label: 'Putus sekolah', type: 'number' },
    { key: 'program_pendidikan', label: 'Program pendidikan desa', type: 'textarea' },
  ],
  'data-pekerjaan': [
    { key: 'tahun_data', label: 'Tahun data', type: 'number' },
    { key: 'petani', label: 'Petani/pekebun', type: 'number' },
    { key: 'buruh_tani', label: 'Buruh tani', type: 'number' },
    { key: 'wirausaha', label: 'Wirausaha/UMKM', type: 'number' },
    { key: 'pegawai', label: 'ASN/TNI/Polri/pegawai', type: 'number' },
    { key: 'pelajar_mahasiswa', label: 'Pelajar/mahasiswa', type: 'number' },
    { key: 'pekerjaan_lain', label: 'Pekerjaan lainnya', type: 'number' },
    { key: 'sumber_data', label: 'Sumber data', type: 'textarea' },
  ],
  'data-sosial': [
    { key: 'tahun_data', label: 'Tahun data', type: 'number' },
    { key: 'islam', label: 'Islam', type: 'number' },
    { key: 'kristen', label: 'Kristen', type: 'number' },
    { key: 'katolik', label: 'Katolik', type: 'number' },
    { key: 'hindu', label: 'Hindu', type: 'number' },
    { key: 'buddha_konghucu_lainnya', label: 'Buddha/Konghucu/lainnya', type: 'number' },
    { key: 'kegiatan_sosial', label: 'Kegiatan dan lembaga sosial', type: 'textarea' },
    { key: 'sumber_data', label: 'Sumber data', type: 'textarea' },
  ],
  'idm-sdgs': [
    { key: 'tahun_idm', label: 'Tahun Indeks Desa Membangun', type: 'number' },
    { key: 'skor_idm', label: 'Skor IDM', type: 'number' },
    { key: 'status_idm', label: 'Status IDM', placeholder: 'Sangat tertinggal / tertinggal / berkembang / maju / mandiri' },
    { key: 'tahun_sdgs', label: 'Tahun pemutakhiran SDGs', type: 'number' },
    { key: 'skor_sdgs', label: 'Skor/capaian SDGs', type: 'text' },
    { key: 'prioritas', label: 'Prioritas pembangunan', type: 'textarea' },
    { key: 'sumber_data', label: 'Sumber dokumen resmi', type: 'textarea' },
  ],
  'standar-pelayanan': [
    { key: 'nama_layanan', label: 'Nama layanan' },
    { key: 'persyaratan', label: 'Persyaratan', type: 'textarea', help: 'Satu persyaratan per baris.' },
    { key: 'prosedur', label: 'Prosedur layanan', type: 'textarea' },
    { key: 'waktu_penyelesaian', label: 'Waktu penyelesaian' },
    { key: 'biaya', label: 'Biaya/tarif resmi', placeholder: 'Contoh: Gratis, jika sesuai ketentuan' },
    { key: 'produk_layanan', label: 'Produk layanan' },
    { key: 'penanggung_jawab', label: 'Petugas/unit penanggung jawab' },
    { key: 'kanal_pengaduan', label: 'Kontak pengaduan' },
  ],
  'agenda-pengumuman': [
    { key: 'jenis_agenda', label: 'Jenis agenda/pengumuman' },
    { key: 'tanggal_mulai', label: 'Tanggal mulai', type: 'date' },
    { key: 'tanggal_selesai', label: 'Tanggal selesai', type: 'date' },
    { key: 'waktu', label: 'Waktu pelaksanaan' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'penyelenggara', label: 'Penyelenggara' },
    { key: 'sasaran', label: 'Sasaran/peserta' },
    { key: 'informasi_pendaftaran', label: 'Pendaftaran atau tindak lanjut', type: 'textarea' },
  ],
  'ppid-informasi-publik': [
    { key: 'nama_informasi', label: 'Nama informasi publik' },
    { key: 'kategori_informasi', label: 'Kategori informasi', placeholder: 'Berkala / serta-merta / setiap saat' },
    { key: 'ringkasan', label: 'Ringkasan informasi', type: 'textarea' },
    { key: 'tahun', label: 'Tahun dokumen', type: 'number' },
    { key: 'tanggal_penetapan', label: 'Tanggal penetapan/pembaruan', type: 'date' },
    { key: 'pejabat_ppid', label: 'Penanggung jawab PPID' },
    { key: 'url_dokumen', label: 'URL dokumen publik', type: 'url' },
    { key: 'dasar_hukum', label: 'Dasar hukum/keterangan akses', type: 'textarea' },
  ],
  'dokumen-publik': [
    { key: 'nama_dokumen', label: 'Nama dokumen' },
    { key: 'nomor_dokumen', label: 'Nomor dokumen' },
    { key: 'tanggal_dokumen', label: 'Tanggal dokumen', type: 'date' },
    { key: 'tahun_anggaran', label: 'Tahun anggaran', type: 'number' },
    { key: 'kategori_dokumen', label: 'Kategori dokumen' },
    { key: 'ringkasan_dokumen', label: 'Ringkasan', type: 'textarea' },
    { key: 'url_dokumen', label: 'Tautan file yang telah disetujui', type: 'url' },
    { key: 'status_verifikasi', label: 'Status verifikasi' },
  ],
  'produk-hukum': [
    { key: 'jenis_produk_hukum', label: 'Jenis produk hukum', placeholder: 'Perdes / Perkades / keputusan' },
    { key: 'nomor', label: 'Nomor dan tahun' },
    { key: 'tentang', label: 'Tentang' },
    { key: 'tanggal_penetapan', label: 'Tanggal penetapan', type: 'date' },
    { key: 'pejabat_penetap', label: 'Pejabat penetap' },
    { key: 'status_berlaku', label: 'Status berlaku' },
    { key: 'abstrak', label: 'Abstrak/ringkasan', type: 'textarea' },
    { key: 'url_dokumen', label: 'Tautan dokumen', type: 'url' },
  ],
  'rpjm-desa': [
    { key: 'periode', label: 'Periode RPJM Desa', placeholder: 'Contoh: 2020–2027' },
    { key: 'visi_pembangunan', label: 'Visi pembangunan', type: 'textarea' },
    { key: 'misi_pembangunan', label: 'Misi pembangunan', type: 'textarea' },
    { key: 'bidang_prioritas', label: 'Bidang prioritas', type: 'textarea' },
    { key: 'indikator_target', label: 'Indikator dan target', type: 'textarea' },
    { key: 'nomor_penetapan', label: 'Nomor peraturan penetapan' },
    { key: 'url_dokumen', label: 'Tautan dokumen resmi', type: 'url' },
  ],
  'rkp-desa': [
    { key: 'tahun_anggaran', label: 'Tahun anggaran', type: 'number' },
    { key: 'prioritas_kegiatan', label: 'Prioritas kegiatan', type: 'textarea' },
    { key: 'lokasi_kegiatan', label: 'Lokasi kegiatan', type: 'textarea' },
    { key: 'target_keluaran', label: 'Target keluaran', type: 'textarea' },
    { key: 'perkiraan_anggaran', label: 'Perkiraan anggaran (Rp)', type: 'number' },
    { key: 'sumber_pendanaan', label: 'Sumber pendanaan' },
    { key: 'nomor_penetapan', label: 'Nomor peraturan penetapan' },
    { key: 'url_dokumen', label: 'Tautan dokumen resmi', type: 'url' },
  ],
  'apbdes-realisasi': [
    { key: 'tahun_anggaran', label: 'Tahun anggaran', type: 'number' },
    { key: 'pendapatan_anggaran', label: 'Anggaran pendapatan (Rp)', type: 'number' },
    { key: 'pendapatan_realisasi', label: 'Realisasi pendapatan (Rp)', type: 'number' },
    { key: 'belanja_anggaran', label: 'Anggaran belanja (Rp)', type: 'number' },
    { key: 'belanja_realisasi', label: 'Realisasi belanja (Rp)', type: 'number' },
    { key: 'pembiayaan', label: 'Pembiayaan (Rp)', type: 'number' },
    { key: 'catatan', label: 'Catatan penjelasan', type: 'textarea' },
    { key: 'url_dokumen', label: 'Tautan APBDes/dokumen resmi', type: 'url' },
  ],
  'laporan-pembangunan': [
    { key: 'nama_kegiatan', label: 'Nama kegiatan pembangunan' },
    { key: 'tahun_anggaran', label: 'Tahun anggaran', type: 'number' },
    { key: 'lokasi', label: 'Lokasi kegiatan' },
    { key: 'volume', label: 'Volume pekerjaan', placeholder: 'Panjang, luas, unit, dan satuan' },
    { key: 'anggaran', label: 'Anggaran (Rp)', type: 'number' },
    { key: 'realisasi_fisik', label: 'Realisasi fisik (%)', type: 'number' },
    { key: 'realisasi_keuangan', label: 'Realisasi keuangan (%)', type: 'number' },
    { key: 'status_kegiatan', label: 'Status kegiatan' },
    { key: 'tanggal_pembaruan', label: 'Tanggal pembaruan', type: 'date' },
  ],
  'jaring-pengaman-sosial': [
    { key: 'nama_program', label: 'Nama program bantuan' },
    { key: 'instansi_penyelenggara', label: 'Instansi penyelenggara' },
    { key: 'periode', label: 'Periode program' },
    { key: 'kriteria_umum', label: 'Kriteria umum penerima', type: 'textarea' },
    { key: 'persyaratan', label: 'Persyaratan dan alur resmi', type: 'textarea' },
    { key: 'jadwal', label: 'Jadwal dan lokasi layanan' },
    { key: 'kontak_resmi', label: 'Kontak resmi untuk pertanyaan' },
    { key: 'catatan_privasi', label: 'Catatan privasi', type: 'textarea', help: 'Jangan memasukkan nama, NIK, alamat, atau daftar penerima bantuan.' },
  ],
  'pasar-umkm': [
    { key: 'nama_umkm', label: 'Nama UMKM/produk' },
    { key: 'pemilik_usaha', label: 'Nama usaha/pemilik yang disetujui untuk publikasi' },
    { key: 'kategori_produk', label: 'Kategori produk' },
    { key: 'deskripsi_produk', label: 'Deskripsi produk', type: 'textarea' },
    { key: 'harga', label: 'Harga atau rentang harga' },
    { key: 'wilayah_usaha', label: 'Dusun/lokasi usaha' },
    { key: 'kontak_publik', label: 'Kontak usaha yang disetujui untuk publikasi' },
    { key: 'tautan_katalog', label: 'Tautan katalog/pemesanan', type: 'url' },
  ],
  'klinik-umkm': [
    { key: 'jenis_pendampingan', label: 'Jenis pendampingan' },
    { key: 'sasaran', label: 'Sasaran peserta' },
    { key: 'jadwal', label: 'Jadwal layanan' },
    { key: 'lokasi', label: 'Lokasi layanan' },
    { key: 'persyaratan', label: 'Persyaratan', type: 'textarea' },
    { key: 'narahubung', label: 'Narahubung resmi' },
    { key: 'tautan_pendaftaran', label: 'Tautan pendaftaran', type: 'url' },
  ],
  'ambulans-desa': [
    { key: 'nomor_layanan', label: 'Nomor layanan darurat/resmi' },
    { key: 'jam_layanan', label: 'Jam operasional' },
    { key: 'cakupan_layanan', label: 'Cakupan layanan', type: 'textarea' },
    { key: 'syarat_penggunaan', label: 'Syarat penggunaan' },
    { key: 'biaya', label: 'Biaya/tarif resmi' },
    { key: 'wilayah_layanan', label: 'Wilayah layanan' },
    { key: 'catatan_darurat', label: 'Petunjuk kondisi darurat', type: 'textarea' },
  ],
  'aspirasi-pengaduan': [
    { key: 'kanal_penerimaan', label: 'Kanal penerimaan aspirasi/pengaduan', type: 'textarea' },
    { key: 'kontak_resmi', label: 'Kontak resmi' },
    { key: 'jam_layanan', label: 'Jam layanan' },
    { key: 'alur_penanganan', label: 'Alur penanganan', type: 'textarea' },
    { key: 'target_respons', label: 'Target waktu respons' },
    { key: 'perlindungan_pelapor', label: 'Perlindungan dan kerahasiaan pelapor', type: 'textarea' },
  ],
  'komunitas-digital': [
    { key: 'nama_komunitas', label: 'Nama komunitas/program digital' },
    { key: 'tujuan', label: 'Tujuan', type: 'textarea' },
    { key: 'kegiatan', label: 'Kegiatan utama', type: 'textarea' },
    { key: 'jadwal', label: 'Jadwal kegiatan' },
    { key: 'lokasi', label: 'Lokasi/kanal komunitas' },
    { key: 'syarat_keanggotaan', label: 'Syarat keanggotaan' },
    { key: 'tautan', label: 'Tautan komunitas', type: 'url' },
  ],
  'posyantek': [
    { key: 'nama_inovasi', label: 'Nama teknologi/inovasi tepat guna' },
    { key: 'manfaat', label: 'Manfaat bagi warga', type: 'textarea' },
    { key: 'kelompok_sasaran', label: 'Kelompok sasaran' },
    { key: 'pengelola', label: 'Pengelola/mitra' },
    { key: 'jadwal_layanan', label: 'Jadwal layanan' },
    { key: 'cara_mengakses', label: 'Cara mengakses', type: 'textarea' },
    { key: 'kontak', label: 'Kontak resmi' },
  ],
  'wifi-publik': [
    { key: 'nama_lokasi', label: 'Nama titik Wi-Fi' },
    { key: 'alamat_lokasi', label: 'Alamat/lokasi titik akses' },
    { key: 'jam_operasional', label: 'Jam operasional' },
    { key: 'cara_akses', label: 'Cara mengakses jaringan', type: 'textarea' },
    { key: 'syarat_penggunaan', label: 'Syarat penggunaan' },
    { key: 'kontak_gangguan', label: 'Kontak pelaporan gangguan' },
    { key: 'status_layanan', label: 'Status layanan' },
  ],
  'perpustakaan-desa': [
    { key: 'nama_perpustakaan', label: 'Nama perpustakaan/taman baca' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'jam_buka', label: 'Jam buka' },
    { key: 'koleksi', label: 'Koleksi dan fasilitas', type: 'textarea' },
    { key: 'syarat_keanggotaan', label: 'Syarat keanggotaan' },
    { key: 'aturan_peminjaman', label: 'Aturan peminjaman', type: 'textarea' },
    { key: 'kontak', label: 'Kontak pengelola' },
  ],
  'desa-anti-korupsi': [
    { key: 'indikator', label: 'Indikator/komponen penilaian', type: 'textarea' },
    { key: 'kebijakan', label: 'Kebijakan dan komitmen', type: 'textarea' },
    { key: 'transparansi_anggaran', label: 'Transparansi anggaran', type: 'textarea' },
    { key: 'kanal_pengaduan', label: 'Kanal pengaduan' },
    { key: 'dokumen_bukti', label: 'Dokumen bukti pendukung', type: 'textarea' },
    { key: 'tanggal_pembaruan', label: 'Tanggal pembaruan', type: 'date' },
    { key: 'penanggung_jawab', label: 'Penanggung jawab' },
  ],
};
const getModuleFields = (key: string): ModuleField[] => moduleFields[key] ?? commonFields;
const jsonObject = (value: Json): Record<string, Json> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, Json> : {};


export default function PortalModulesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [modules, setModules] = useState<PortalModule[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const selected = modules.find((item) => item.id === selectedId) ?? null;
  const canPublish = role === 'admin' || role === 'publisher';
  const canEdit = role === 'admin' || role === 'publisher' || role === 'editor';

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/admin/login'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    setRole(profile?.role ?? '');
    const { data, error } = await supabase.from('portal_modules').select('*').order('display_order').order('title');
    if (error) setMessage('Modul belum dapat dimuat. Periksa migrasi dan kebijakan akses database.');
    else {
      const rows = (data ?? []) as PortalModule[];
      setModules(rows);
      const requestedKey = new URLSearchParams(window.location.search).get('module');
      const requestedModule = requestedKey ? rows.find((item) => item.module_key === requestedKey) : undefined;
      setSelectedId(requestedModule?.id ?? (current => current && rows.some((item) => item.id === current) ? current : rows[0]?.id ?? ''));
    }
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!selected) return;
    setTitle(selected.title);
    setSummary(selected.summary);
    setBody(selected.body);
    const stored = jsonObject(selected.data);\n    const values: Record<string, string> = {};\n    for (const field of getModuleFields(selected.module_key)) {\n      const value = stored[field.key];\n      values[field.key] = Array.isArray(value) ? value.join('\\n') : value == null ? '' : String(value);\n    }\n    setFormData(values);
  }, [selectedId, selected?.updated_at]);

  async function save(nextStatus: 'draft' | 'published') {
    if (!supabase || !selected) return;
    if (nextStatus === 'published' && !canPublish) {
      setMessage('Akun editor hanya dapat menyimpan draf. Peran publisher atau admin diperlukan untuk publikasi.');
      return;
    }
    const existingData = jsonObject(selected.data);
    const structuredData: Record<string, Json> = { ...existingData };
    for (const field of getModuleFields(selected.module_key)) {
      const value = (formData[field.key] ?? '').trim();
      if (field.type === 'number' && value !== '') {
        const numberValue = Number(value);
        if (!Number.isFinite(numberValue)) { setMessage('Kolom "' + field.label + '" harus berupa angka.'); return; }
        structuredData[field.key] = numberValue;
      } else {
        structuredData[field.key] = value;
      }
    }
    setBusy(true); setMessage('');
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('portal_modules').update({
      title: title.trim(), summary: summary.trim(), body: body.trim(), data: structuredData as Json,
      status: nextStatus, published_at: nextStatus === 'published' ? (selected.published_at ?? new Date().toISOString()) : null,
      updated_by: user?.id ?? null,
    }).eq('id', selected.id);
    setBusy(false);
    if (error) { setMessage(error.code === '42501' ? 'Akses ditolak oleh kebijakan database. Periksa peran akun.' : 'Simpan gagal. Periksa koneksi dan data yang dimasukkan.'); return; }
    setMessage(nextStatus === 'published' ? 'Modul berhasil dipublikasikan.' : 'Draf modul berhasil disimpan.');
    await load();
  }

  if (loading) return <main className="admin-page"><div className="admin-loading">Memuat katalog modul…</div></main>;
  if (!supabase) return <main className="admin-page"><section className="setup-notice"><h1>Supabase belum terhubung</h1><Link href="/admin">Kembali ke ruang kerja</Link></section></main>;

  return <main className="admin-page admin-page-with-sidebar">
    <AdminSidebar />
    <header className="admin-topbar"><Link className="brand" href="/admin"><span className="brand-mark">B</span><span><strong>SID BAWANGAN</strong><small>Pengelolaan modul portal</small></span></Link><div className="admin-top-actions"><span className="signed-in">Peran: {role || 'belum ditetapkan'}</span><Link className="button-quiet" href="/">Lihat website ↗</Link></div></header>
    <section className="admin-heading"><div><p className="eyebrow">KATALOG KONTEN</p><h1>Modul website desa</h1><p>Semua menu sudah memiliki kerangka data. Pilih modul, isi informasi terverifikasi dan data terstruktur, simpan sebagai draf, lalu publikasikan sesuai kewenangan.</p></div><div className="admin-stats"><div><strong>{modules.length}</strong><span>Modul disiapkan</span></div><div><strong>{modules.filter((item) => item.status === 'published').length}</strong><span>Terbit</span></div><div><strong>{modules.filter((item) => item.status === 'draft').length}</strong><span>Draf</span></div></div></section>
    {message && <div className="status-message" role="status">{message}</div>}
    <div className="workspace-grid">
      <section className="posts-panel"><div className="panel-heading"><div><p className="eyebrow">DAFTAR MODUL</p><h2>Pilih bagian website</h2></div><button className="button-quiet" onClick={() => void load()}>Muat ulang ↻</button></div>
        <div className="post-list">{modules.map((item) => <button type="button" key={item.id} onClick={() => setSelectedId(item.id)} className="post-row" style={{ width: '100%', textAlign: 'left', border: selectedId === item.id ? '2px solid var(--green, #176b4d)' : undefined, background: selectedId === item.id ? 'var(--mint, #eaf4ee)' : undefined, cursor: 'pointer' }}><div className="post-row-main"><span className={'state-dot ' + item.status}/><div><h3>{item.title}</h3><p>{categoryLabels[item.category] ?? item.category} · {item.module_key}</p></div></div><span className={'status-pill ' + item.status}>{prettyStatus[item.status]}</span></button>)}</div>
      </section>
      <section className="editor-panel"><div className="panel-heading"><div><p className="eyebrow">EDITOR MODUL</p><h2>{selected?.title ?? 'Pilih modul'}</h2></div>{selected && <span className={'status-pill ' + selected.status}>{prettyStatus[selected.status]}</span>}</div>
        {!selected ? <p>Tidak ada modul yang tersedia.</p> : <>
          <p className="login-copy">Kunci modul: <code>{selected.module_key}</code>. Kategori dan kunci dipertahankan agar menu tidak terputus.</p>
          <label htmlFor="module-title">Judul tampil</label><input id="module-title" disabled={!canEdit} value={title} maxLength={180} onChange={(event) => setTitle(event.target.value)} />
          <label htmlFor="module-summary">Ringkasan</label><textarea id="module-summary" disabled={!canEdit} rows={3} maxLength={800} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Ringkasan singkat untuk pengunjung" />
          <label htmlFor="module-body">Isi informasi</label><textarea id="module-body" disabled={!canEdit} rows={7} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Masukkan narasi resmi, prosedur, sumber, atau keterangan terverifikasi." />
          <section className="module-specific-fields">
            <div className="panel-heading"><div><p className="eyebrow">DATA KHUSUS MODUL</p><h3>Informasi {selected.title}</h3></div></div>
            <p className="login-copy">Form ini disesuaikan dengan menu yang dipilih. Isi hanya informasi yang sudah diverifikasi dari sumber resmi; kolom kosong boleh dibiarkan bila datanya belum tersedia.</p>
            <div className="module-fields-grid">
              {getModuleFields(selected.module_key).map((field) => <div className={field.type === 'textarea' ? 'module-field module-field-wide' : 'module-field'} key={field.key}>
                <label htmlFor={'field-' + field.key}>{field.label}</label>
                {field.type === 'textarea'
                  ? <textarea id={'field-' + field.key} disabled={!canEdit} rows={3} value={formData[field.key] ?? ''} onChange={(event) => setFormData((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder ?? ''} />
                  : <input id={'field-' + field.key} disabled={!canEdit} type={field.type ?? 'text'} value={formData[field.key] ?? ''} onChange={(event) => setFormData((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder ?? ''} />}
                {field.help && <small className="notice">{field.help}</small>}
              </div>)}
            </div>
          </section>
          {role === 'admin' && <details className="module-advanced-settings">
            <summary>Pengaturan teknis (lanjutan)</summary>
            <p className="login-copy">Bagian ini disediakan untuk administrator teknis. Perubahan langsung terhadap JSON dapat memengaruhi tampilan data pada website publik.</p>
            <pre className="module-json-preview">{JSON.stringify(jsonObject(selected.data), null, 2)}</pre>
          </details>}
          <div className="editor-actions"><button className="button-secondary" disabled={busy || !canEdit} onClick={() => void save('draft')}>{busy ? 'Menyimpan…' : 'Simpan draf'}</button><button className="button-primary" disabled={busy || !canPublish} title={!canPublish ? 'Perlu peran publisher atau admin' : undefined} onClick={() => void save('published')}>{busy ? 'Memproses…' : 'Publikasikan modul'}</button></div>
          {!canEdit && <small className="notice">Akun viewer hanya memiliki akses baca. Hubungi administrator jika perlu mengubah konten.</small>}
          {canEdit && !canPublish && <small className="notice">Akun editor dapat menyiapkan draf. Publikasi dilakukan oleh publisher atau admin.</small>}
        </>}
      </section>
    </div>
    <footer className="admin-footer">SID Bawangan · Semua modul baru dimulai sebagai draf dan hanya dapat dibaca publik setelah dipublikasikan.</footer>
  </main>;
}
