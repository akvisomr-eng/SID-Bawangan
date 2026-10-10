'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  useEffect(()=>{ if(supabase) void supabase.auth.getUser().then(({data})=>{if(data.user)router.replace('/admin')}); },[supabase,router]);
  async function handleSubmit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setError('');
    if(!supabase){setError('Konfigurasi Supabase belum tersedia.');return;}
    setBusy(true);
    const {error:authError}=await supabase.auth.signInWithPassword({email:email.trim(),password});
    setBusy(false);
    if(authError){setError('Login gagal. Periksa email dan kata sandi atau hubungi administrator.');return;}
    router.replace('/admin');router.refresh();
  }
  return <main className="login-wrap"><a className="back-link" href="/">← Kembali ke website</a><section className="login-card"><span className="brand-mark">B</span><p className="eyebrow">AREA PENGELOLA</p><h1>Selamat datang kembali</h1><p className="login-copy">Masuk ke ruang kerja resmi SID Bawangan untuk mengelola berita, pengumuman, profil, dan informasi layanan.</p>
    {!supabase&&<p className="inline-alert">Konfigurasi Supabase belum tersedia pada environment ini.</p>}
    <form onSubmit={handleSubmit}><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email resmi pengelola" autoComplete="username" required/><label htmlFor="password">Kata sandi</label><input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Masukkan kata sandi" autoComplete="current-password" required/><button className="button-primary login-submit" disabled={busy||!supabase} type="submit">{busy?'Memverifikasi…':'Masuk ke panel →'}</button></form>
    {error&&<p className="inline-alert" role="alert">{error}</p>}<small className="notice">Akun dibuat dan dikelola melalui Supabase Auth. Tidak ada pendaftaran publik.</small></section></main>;
}
