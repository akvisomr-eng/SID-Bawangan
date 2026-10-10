'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Post = {title:string;summary:string;body:string;category:string;published_at:string|null};
export default function InformationDetailPage() {
  const params=useParams<{slug:string}>();
  const supabase=useMemo(()=>createSupabaseBrowserClient(),[]);
  const [post,setPost]=useState<Post|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;if(!supabase){setLoading(false);return;}void supabase.from('posts').select('title,summary,body,category,published_at').eq('slug',params.slug).eq('status','published').maybeSingle().then(({data})=>{if(active){setPost(data as Post|null);setLoading(false);}});return()=>{active=false;};},[supabase,params.slug]);
  const date=post?.published_at?new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(new Date(post.published_at)):'';
  return <main className="detail-shell"><header className="topbar"><a className="brand" href="/"><span className="brand-mark">B</span><span><strong>PEMERINTAH DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></a><a className="admin-link" href="/">Beranda ↗</a></header><a className="back-link detail-back" href="/">← Semua informasi</a>{loading?<div className="empty-public">Memuat informasi…</div>:!post?<section className="empty-public"><span className="empty-symbol">✳</span><h1>Informasi tidak ditemukan</h1><p>Konten mungkin belum diterbitkan atau alamatnya tidak sesuai.</p><a className="text-link" href="/">Kembali ke beranda →</a></section>:<article className="detail-article"><p className="eyebrow">INFORMASI RESMI DESA</p><span className="content-tag">{post.category==='news'?'Berita':post.category==='announcement'?'Pengumuman':post.category==='service'?'Layanan':'Profil desa'}</span><h1>{post.title}</h1><p className="detail-date">{date}</p>{post.summary&&<p className="detail-summary">{post.summary}</p>}<div className="detail-body">{post.body.split(/\n\s*\n/).map((p,i)=><p key={i}>{p}</p>)}</div><div className="detail-note">Informasi ini berasal dari portal Pemerintah Desa Bawangan. Untuk kepastian, gunakan kontak resmi pemerintah desa.</div></article>}<footer className="site-footer"><a className="brand footer-brand" href="/"><span className="brand-mark">B</span><span><strong>DESA BAWANGAN</strong><small>Kecamatan Ploso · Kabupaten Jombang</small></span></a><p>© {new Date().getFullYear()} Pemerintah Desa Bawangan</p></footer></main>;
}
