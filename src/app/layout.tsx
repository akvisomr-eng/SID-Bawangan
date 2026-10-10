import type { Metadata } from 'next';
import './globals.css';
import AICompanion from '@/components/ai-companion';

export const metadata: Metadata = {
  title: 'SID Bawangan | Sistem Informasi Desa',
  description: 'Informasi resmi dan layanan Pemerintah Desa Bawangan, Kecamatan Ploso, Kabupaten Jombang.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}<AICompanion /></body></html>;
}
