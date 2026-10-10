'use client';
import { useEffect, useState } from 'react';
const KEY = 'sid-bawangan-demo-trial-start-v1';
const DURATION = 14 * 24 * 60 * 60 * 1000;
export default function AdminTrialNotice() {
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let value = Number(window.localStorage.getItem(KEY));
    if (!Number.isFinite(value) || value <= 0) { value = Date.now(); window.localStorage.setItem(KEY, String(value)); }
    setStart(value);
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  if (start === null) return null;
  const remaining = Math.max(0, DURATION - (now - start));
  const days = Math.ceil(remaining / 86400000);
  const expiry = new Date(start + DURATION).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  return <div role="status" aria-live="polite" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',padding:'12px 18px',margin:'12px 16px',border:'1px solid #d8c28a',borderRadius:12,background:remaining===0?'#fff1f0':'#fff9e8',color:'#493b19',fontSize:14,lineHeight:1.45}}><div><strong style={{display:'block'}}>{remaining===0?'Masa trial 14 hari telah berakhir':'Trial administrator SID Bawangan · 14 hari'}</strong><span>{remaining===0?'Mode simulasi berakhir. Data contoh tetap terpisah dari data resmi desa.':days+' hari tersisa · Berakhir '+expiry+'. Mode simulasi aktif; perubahan tidak menyentuh basis data resmi desa.'}</span></div><span style={{minWidth:54,textAlign:'center',padding:'7px 10px',borderRadius:9,background:'#f0e2b8',fontWeight:800,fontSize:16}}>{days} HARI</span></div>;
}
