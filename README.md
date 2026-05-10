# FoodMap Madiun

> *Temukan. Pesan. Datang.*
>
> *Bukan yang paling besar. Tapi yang paling mudah ditemukan.*

Direktori PKL & warung kaki lima ber-spot tetap di Madiun. Peta interaktif,
menu transparan, pesan langsung via WhatsApp.

---

## 🌊 Untuk siapa app ini

**Pelanggan:** siapa saja yang mau cari kuliner deket lokasinya. Tanpa daftar,
tanpa download apapun. Klik marker → lihat menu → tap WhatsApp.

**Pedagang:** PKL ber-spot tetap yang belum keindex Google Maps, belum punya
Instagram aktif, tapi punya warung dan WhatsApp. Admin (operator) yang
masukin datanya — pedagang ga perlu paham teknologi.

---

## 🛠️ Stack

Next.js 16 · React 19.2 · TypeScript 5 · Tailwind v4 · shadcn/ui (New York) ·
shadcn-map (Leaflet) · Supabase (Postgres + PostGIS) · Cloudinary · Vercel.

---

## 🚀 Run lokal

Prerequisite: Node ≥ 20.9, pnpm ≥ 9.

```bash
# 1. Install deps
pnpm install

# 2. Setup env (isi sesuai project Supabase + Cloudinary kamu)
cp .env.example .env.local

# 3. Generate types Supabase (sekali setelah schema deployed)
pnpm types:gen

# 4. Run dev server
pnpm dev
```

Buka http://localhost:3000 — placeholder homepage muncul.
Akses `/admin` tanpa login → otomatis redirect ke `/login` (proxy gate).

---

## 📂 Struktur

```
app/         → routes (public + admin) — App Router
components/  → ui (shadcn), public, admin, shared
lib/         → supabase clients, validators, helpers, constants
types/       → Database (auto-gen) + composed types
hooks/       → data fetching (Phase 4+)
```

Detail struktur lock ada di dokumen `01-FOUNDATION-NEXTJS.md` di repo root proyek (bukan di-commit, simpan di tempat aman).

---

## 🔐 Admin

Admin login pakai Supabase Auth + custom claim `app_metadata.role = 'super_admin'`.
Setup detail di `02-DATABASE-SCHEMA.md` section 7.

User non-admin yang coba akses `/admin` → di-redirect ke `/` oleh `proxy.ts`.

---

## 📦 Deploy

- **App** → Vercel (auto-deploy from main branch)
- **DB** → Supabase (region Singapore)
- **Foto** → Cloudinary (free tier)

Set semua env vars di Vercel dashboard sesuai `.env.example`.

---

## 📄 Lisensi

Private — © 2026.
