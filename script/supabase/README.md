# FoodMap Madiun — SQL Setup & Seed Admin

File-file ini sudah di-audit terhadap codebase (Next.js + RLS + RPC + slug routing).

## 📦 Isi

| File | Tujuan | Kapan dijalankan |
|---|---|---|
| `00_setup_all.sql` | Setup lengkap: extensions, tables, triggers, RPC, RLS, grants, seed | **Pertama kali setup** — sekali jalan di SQL Editor |
| `01_patch_slugify_fix.sql` | **Patch khusus** — fix urutan dependency `slugify`/`unaccent_safe`. **Hanya jalankan kalau kena error `function unaccent_safe(text) does not exist`** | Setelah `00_setup_all.sql` kalau error |
| `seed-admin.js` | Buat super admin via Supabase Admin API + set role claim | Setelah SQL setup sukses |
| `_rollback.sql` | Drop semua (untuk dev/staging reset) | Hanya kalau mau hard reset |

## 🚀 Urutan Eksekusi (FRESH SETUP)

### 1. Run `00_setup_all.sql`

- SQL Editor di Supabase → paste seluruh isi → **Run**.

### 2. Run `seed-admin.js`

```bash
# Pastikan .env.local sudah berisi:
#   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY=eyJ...
#
# Install dependencies kalau belum:
npm install @supabase/supabase-js dotenv

# Jalankan
node seed-admin.js
```

Output yang diharapkan:
```
🚀 SEED ADMIN - FOODMAP MADIUN
=============================================

📋 Total admin: 1


📝 Processing: Fibidy Dev (fibidydev01@gmail.com)
   🔐 Membuat auth user...
   ✅ Auth user dibuat: <uuid>
   🔑 Set role claim: (none) → super_admin


=============================================
📊 HASIL
=============================================

✅ Created : 1
   ✅ Fibidy Dev (fibidydev01@gmail.com) — super_admin
...
```

### 3. Test login

- `pnpm dev`
- Buka `http://localhost:3000/login`
- Login: `fibidydev01@gmail.com` / `kulinerm@diun123`
- Harus auto-redirect ke `/admin`.

> **Penting**: kalau pernah login *sebelum* role di-set, **logout-login lagi**. JWT cached, harus refresh untuk dapat claim baru.

---

## 🔧 Urutan Eksekusi (KALAU SEMPAT KENA ERROR `unaccent_safe`)

Kalau Anda sempat run `00_setup_all.sql` versi lama dan dapet error:
```
ERROR: 42883: function unaccent_safe(text) does not exist
```

Database sudah keburu setengah-jadi. Jalankan:

### 1. Run `01_patch_slugify_fix.sql`

- SQL Editor → paste → Run.
- Script ini drop function lama yang broken, re-create dengan urutan benar, re-attach trigger, dan **backfill slug** untuk row tenants yang sudah keburu masuk.

### 2. Lanjut ke `seed-admin.js` seperti normal

---

## 🔍 Verifikasi Pasca-Setup

Jalankan satu per satu di SQL Editor:

```sql
-- 1. Cek extensions (expected: 3 rows)
SELECT extname FROM pg_extension WHERE extname IN ('postgis', 'pg_trgm', 'uuid-ossp');

-- 2. Cek seed data
SELECT count(*) AS tenants    FROM public.tenants;       -- 6
SELECT count(*) AS categories FROM public.categories;    -- 2
SELECT count(*) AS products   FROM public.products;      -- ~25

-- 3. Cek slug auto-generated (expected: semua terisi, no NULL)
SELECT nama, slug FROM public.tenants ORDER BY nama;

-- 4. Test slugify langsung
SELECT public.slugify('Sate Gule Kambing & Sapi DIMONG');
-- Expected: 'sate-gule-kambing-sapi-dimong'

-- 5. Test geo RPC (expected: 6 rows, dist_meters ascending)
SELECT id, nama, dist_meters
FROM public.nearby_tenants(-7.5650, 111.5320, 2);

-- 6. Cek admin role
SELECT email, raw_app_meta_data ->> 'role' AS role
FROM auth.users
WHERE raw_app_meta_data ->> 'role' = 'super_admin';
-- Expected: 1 row, email = fibidydev01@gmail.com
```

---

## 🆕 Apa yang Diaudit / Diperbaiki

| # | Issue | Fix |
|---|---|---|
| 1 | Schema asli ga punya kolom `slug`, padahal `src/app/[slug]/page.tsx` query by slug | Tambah kolom `tenants.slug TEXT UNIQUE` + index |
| 2 | Trigger auto-generate slug disebut di komentar tapi ga ditulis | Bikin trigger `tenants_set_slug_trigger` + function `slugify()` + helper `unaccent_safe()` |
| 3 | **Bug**: `slugify` reference `unaccent_safe` tapi dideklarasi DULUAN (LANGUAGE sql validate dependency saat CREATE) | **Swap urutan**: `unaccent_safe` dulu → `slugify` belakangan + tambah `public.` prefix |
| 4 | SQL admin setup pakai email manual via Dashboard (ribet, manual) | Ganti pakai `seed-admin.js` — idempotent, automated, style consistent dengan e-raport script Anda |

---

## 🐛 Troubleshooting

**`function unaccent_safe(text) does not exist`**
→ Versi lama 00_setup_all.sql. Jalankan `01_patch_slugify_fix.sql`.

**`permission denied for schema extensions`**
→ Database → Extensions di Dashboard, enable manual: `postgis`, `uuid-ossp`, `pg_trgm`.

**`function st_makepoint(...) does not exist`**
→ PostGIS belum aktif. Run `CREATE EXTENSION postgis WITH SCHEMA extensions;` dulu.

**`Cannot use import statement outside a module`** saat run `seed-admin.js`
→ Tambah `"type": "module"` di `package.json`, atau rename file jadi `.mjs`.

**Akses `/admin` ditolak walau sudah set role**
→ Logout-login lagi. JWT di-cached browser, harus refresh untuk dapat claim baru.

**`seed-admin.js` error `Invalid login credentials` saat verifikasi manual**
→ Cek `email_confirm: true` di `createUser()` — script sudah set ini, tapi kalau auth user dibuat dari Dashboard tanpa "Auto Confirm User: ON", harus confirm manual via Dashboard.
