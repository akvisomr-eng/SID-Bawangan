'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const TRIAL_KEY = 'sid-bawangan-demo-trial-start-v1';
const DB_KEY = 'sid-bawangan-admin-trial-db-v1';
const TRIAL_MS = 14 * 24 * 60 * 60 * 1000;
const demoUser = { id: 'demo-admin-bawangan', email: 'administrator.demo@sid-bawangan.local', user_metadata: { full_name: 'Administrator Demo' }, app_metadata: {}, aud: 'authenticated', created_at: '2026-10-10T00:00:00.000Z' };

const moduleDefinitions: Array<[string, string, string]> = [
  ['profil-desa','Profil Desa','profil'],['struktur-pemerintahan','Pemerintahan Desa','profil'],['wilayah-desa','Wilayah Desa','data_desa'],
  ['statistik-penduduk','Statistik Desa','data_desa'],['pendidikan-dalam-kk','Pendidikan dalam KK','data_desa'],['pendidikan-ditempuh','Pendidikan Ditempuh','data_desa'],
  ['data-pekerjaan','Data Pekerjaan','data_desa'],['data-sosial','Data Agama & Sosial','data_desa'],['idm-sdgs','IDM & SDGs Desa','data_desa'],
  ['standar-pelayanan','Standar Pelayanan','layanan'],['agenda-pengumuman','Agenda & Pengumuman','agenda'],['ppid-informasi-publik','PPID & Informasi Publik','ppid'],
  ['dokumen-publik','Dokumen Publik','dokumen'],['produk-hukum','Produk Hukum','dokumen'],['rpjm-desa','RPJM Desa','transparansi'],
  ['rkp-desa','RKP Desa','transparansi'],['apbdes-realisasi','APBDes & Realisasi','transparansi'],['laporan-pembangunan','Laporan Pembangunan','transparansi'],
  ['jaring-pengaman-sosial','Jaring Pengaman Sosial','sosial'],['pasar-umkm','Pasar UMKM','layanan'],['klinik-umkm','Klinik UMKM','layanan'],
  ['ambulans-desa','Ambulans Desa','layanan'],['aspirasi-pengaduan','Aspirasi & Pengaduan','layanan'],['komunitas-digital','Komunitas Digital','layanan'],
  ['posyantek','Posyantek','layanan'],['wifi-publik','Wi-Fi Publik','layanan'],['perpustakaan-desa','Perpustakaan Desa','layanan'],['desa-anti-korupsi','Desa Anti Korupsi','anti_korupsi'],
];

type Row = Record<string, any>;
type Store = Record<string, Row[]>;

function seedStore(): Store {
  const now = new Date().toISOString();
  return {
    profiles: [{ id: demoUser.id, full_name: 'Administrator Demo', email: demoUser.email, role: 'admin', created_at: now }],
    posts: [
      { id: 'demo-post-1', title: 'Kerja Bakti Lingkungan Desa', slug: 'kerja-bakti-lingkungan-desa', summary: 'Contoh pengumuman untuk demonstrasi panel.', body: 'INI DATA CONTOH. Bukan pengumuman resmi Pemerintah Desa Bawangan.', category: 'announcement', status: 'published', created_at: now, updated_at: now, published_at: now, author_id: demoUser.id },
      { id: 'demo-post-2', title: 'Informasi Jam Pelayanan Kantor Desa', slug: 'informasi-jam-pelayanan-kantor-desa', summary: 'Contoh informasi layanan.', body: 'INI DATA CONTOH. Verifikasi informasi resmi sebelum penggunaan produksi.', category: 'service', status: 'draft', created_at: now, updated_at: now, published_at: null, author_id: demoUser.id },
    ],
    portal_modules: moduleDefinitions.map(([module_key, title, category], index) => ({
      id: 'demo-module-' + module_key, module_key, title, category,
      summary: 'Data contoh untuk demonstrasi modul ' + title + '.',
      body: 'MODE DEMO — isi informasi ini bukan data resmi desa. Silakan uji formulir dan alur penyimpanan.',
      data: { keterangan: 'DATA CONTOH — tidak mewakili informasi resmi Desa Bawangan.' },
      status: index < 3 ? 'published' : 'draft', display_order: index + 1,
      published_at: index < 3 ? now : null, updated_at: now, updated_by: demoUser.id,
    })),
  };
}

function loadStore(): Store {
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) return { ...seedStore(), ...JSON.parse(raw) } as Store;
  } catch { /* use fresh demo data */ }
  return seedStore();
}
function saveStore(store: Store) {
  try { window.localStorage.setItem(DB_KEY, JSON.stringify(store)); } catch { /* keep session-only demo */ }
}
function trialIsActive() {
  try {
    const start = Number(window.localStorage.getItem(TRIAL_KEY));
    return Number.isFinite(start) && start > 0 && Date.now() - start < TRIAL_MS;
  } catch { return false; }
}
function matches(row: Row, filters: Array<[string, unknown]>) {
  return filters.every(([key, value]) => row[key] === value);
}

export function createDemoSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (typeof window === 'undefined' || !trialIsActive()) return null;
  const auth = {
    getUser: async () => ({ data: { user: demoUser }, error: null }),
    getSession: async () => ({ data: { session: { user: demoUser, access_token: 'demo-only', token_type: 'bearer', expires_in: 0, refresh_token: 'demo-only' } }, error: null }),
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      queueMicrotask(() => callback('SIGNED_IN', { user: demoUser, access_token: 'demo-only' }));
      return { data: { subscription: { unsubscribe() {} } } };
    },
    signOut: async () => ({ error: null }),
  };

  const client: any = {
    auth,
    from(table: string) {
      let action: 'select' | 'insert' | 'update' = 'select';
      let payload: Row | Row[] | null = null;
      const filters: Array<[string, unknown]> = [];
      const orders: Array<{ column: string; ascending: boolean }> = [];
      let limitCount: number | null = null;
      const query: any = {
        select() { if (action === 'select') action = 'select'; return query; },
        eq(column: string, value: unknown) { filters.push([column, value]); return query; },
        order(column: string, options?: { ascending?: boolean }) { orders.push({ column, ascending: options?.ascending ?? true }); return query; },
        limit(count: number) { limitCount = Math.max(0, Math.floor(count)); return query; },
        maybeSingle() { return Promise.resolve(execute()).then(({ data, error }) => ({ data: Array.isArray(data) ? data[0] ?? null : data, error })); },
        single() { return query.maybeSingle(); },
        insert(value: Row | Row[]) { action = 'insert'; payload = value; return query; },
        update(value: Row) { action = 'update'; payload = value; return query; },
        delete() { action = 'update'; payload = { __demo_deleted: true }; return query; },
        then(resolve: (value: any) => unknown, reject?: (reason: unknown) => unknown) { return Promise.resolve(execute()).then(resolve, reject); },
      };
      function execute(): { data: any; error: any } {
        const store = loadStore();
        const rows = store[table] ?? [];
        if (action === 'insert') {
          const incoming = Array.isArray(payload) ? payload : [payload];
          const added = incoming.map((item) => ({ id: item?.id ?? 'demo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...item }));
          store[table] = [...rows, ...added]; saveStore(store);
          return { data: added, error: null };
        }
        const found = rows.filter((row) => matches(row, filters));
        if (action === 'update' && payload) {
          store[table] = rows.filter((row) => !matches(row, filters)).concat(
            found.filter((row) => !(payload as Row).__demo_deleted).map((row) => ({ ...row, ...payload, updated_at: new Date().toISOString() })),
          );
          if ((payload as Row).__demo_deleted) { saveStore(store); return { data: found, error: null }; }
          saveStore(store);
          return { data: found.map((row) => ({ ...row, ...payload })), error: null };
        }
        let result = [...found];
        for (const order of orders.reverse()) result.sort((a, b) => {
          const av = a[order.column] ?? ''; const bv = b[order.column] ?? '';
          const cmp = String(av).localeCompare(String(bv), 'id', { numeric: true });
          return order.ascending ? cmp : -cmp;
        });
        if (limitCount !== null) result = result.slice(0, limitCount);
        return { data: result, error: null };
      }
      return query;
    },
    async rpc(name: string, args?: Row) {
      const store = loadStore();
      if (name === 'admin_list_users') return { data: store.profiles ?? [], error: null };
      if (name === 'admin_set_user_role') {
        const profile = (store.profiles ?? []).find((item) => item.id === args?.target_user_id);
        if (!profile) return { data: null, error: { message: 'Pengguna demo tidak ditemukan.' } };
        profile.role = args?.new_role; saveStore(store); return { data: profile, error: null };
      }
      return { data: null, error: null };
    },
  };
  return client as SupabaseClient<Database>;
}
