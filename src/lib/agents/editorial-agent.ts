export type EditorialCategory = 'news' | 'announcement' | 'service' | 'village_profile';
export type EditorialInput = { title: string; summary: string; body: string; category: EditorialCategory };
export type EditorialFinding = { level: 'error' | 'warning' | 'info'; code: string; message: string };

const categoryNames: Record<EditorialCategory, string> = {
  news: 'Berita', announcement: 'Pengumuman', service: 'Informasi layanan', village_profile: 'Profil desa',
};

/**
 * SID Editorial Agent v1: deterministic, explainable editorial quality checks.
 * It does not send village content to external AI providers or claim to be an LLM.
 * The provider interface can later host an approved private/local model.
 */
export function runEditorialAgent(input: EditorialInput): { score: number; findings: EditorialFinding[]; suggestedSlug: string; checklist: string[] } {
  const findings: EditorialFinding[] = [];
  const title = input.title.trim();
  const summary = input.summary.trim();
  const body = input.body.trim();
  if (title.length < 12) findings.push({ level: 'warning', code: 'TITLE_SHORT', message: 'Judul terlalu singkat; buat judul yang spesifik dan mudah dipahami warga.' });
  if (title.length > 100) findings.push({ level: 'warning', code: 'TITLE_LONG', message: 'Judul cukup panjang; ringkas agar mudah dibaca di layar HP.' });
  if (summary.length < 40) findings.push({ level: 'warning', code: 'SUMMARY_SHORT', message: 'Ringkasan sebaiknya 40–240 karakter dan menjelaskan inti informasi.' });
  if (summary.length > 240) findings.push({ level: 'warning', code: 'SUMMARY_LONG', message: 'Ringkasan terlalu panjang; pertimbangkan 1–2 kalimat.' });
  if (body.length < 120) findings.push({ level: 'error', code: 'BODY_SHORT', message: 'Isi terlalu pendek untuk diperiksa sebagai konten siap publikasi (minimal 120 karakter).' });
  if (!/[.!?](?:["')\]]*)\s*$/.test(body)) findings.push({ level: 'info', code: 'PUNCTUATION', message: 'Periksa kembali tanda baca pada akhir isi.' });
  if (/\b(NIK|nomor KK|kata sandi|password|PIN)\b/i.test(body)) findings.push({ level: 'warning', code: 'SENSITIVE_DATA', message: 'Pastikan konten tidak memuat data pribadi atau kredensial yang tidak boleh dipublikasikan.' });
  if (/\b(pasti sembuh|dijamin|100% aman|nomor rekening|transfer ke)\b/i.test(body)) findings.push({ level: 'warning', code: 'VERIFY_CLAIM', message: 'Verifikasi klaim atau instruksi transaksi sebelum publikasi resmi.' });
  if (!/\b(tanggal|pada|mulai|hingga|sampai|hari)\b/i.test(body) && ['announcement','service'].includes(input.category)) findings.push({ level: 'info', code: 'DATE_CONTEXT', message: 'Jika relevan, cantumkan tanggal, tenggat, jam, lokasi, dan kontak resmi.' });
  if (!findings.length) findings.push({ level: 'info', code: 'BASELINE_OK', message: 'Pemeriksaan dasar tidak menemukan masalah. Tetap lakukan verifikasi faktual oleh petugas berwenang.' });
  const errors = findings.filter(f => f.level === 'error').length;
  const warnings = findings.filter(f => f.level === 'warning').length;
  const score = Math.max(0, 100 - errors * 35 - warnings * 12);
  const suggestedSlug = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'konten-desa';
  return {
    score,
    findings,
    suggestedSlug,
    checklist: [
      'Pastikan fakta, tanggal, lokasi, dan kontak sudah diverifikasi.',
      'Pastikan ada persetujuan pejabat/petugas yang berwenang.',
      'Pastikan tidak ada NIK, nomor KK, data kesehatan, atau informasi privat warga.',
      `Kategori konten: ${categoryNames[input.category]}.`,
    ],
  };
}
