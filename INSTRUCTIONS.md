# 🚀 Apply Instructions — Kuliner Madiun UI/UX Final (Sheet 2-State)

## 📂 File Mapping

| File di ZIP | Path di Project Lo | Action |
|---|---|---|
| `src/app/layout.tsx` | `src/app/layout.tsx` | **REPLACE** |
| `src/hooks/use-media-query.ts` | `src/hooks/use-media-query.ts` | **NEW** |
| `src/hooks/use-tenant-menu.ts` | `src/hooks/use-tenant-menu.ts` | **NEW** |
| `src/components/public/tenant-marker.tsx` | `src/components/public/tenant-marker.tsx` | **REPLACE** |
| `src/components/public/tenant-preview-panel.tsx` | `src/components/public/tenant-preview-panel.tsx` | **NEW** (Mode A) |
| `src/components/public/tenant-menu-panel.tsx` | `src/components/public/tenant-menu-panel.tsx` | **NEW** (Mode B) |
| `src/components/public/tenant-detail-container.tsx` | `src/components/public/tenant-detail-container.tsx` | **NEW** (Sheet/Drawer 2-state) |
| `src/components/public/tenant-map-view.tsx` | `src/components/public/tenant-map-view.tsx` | **REPLACE** |
| `.env.example` | `.env.example` | **REPLACE** |

---

## 🗑️ File yang HARUS DIHAPUS

| File | Alasan |
|---|---|
| `src/app/[slug]/page.tsx` | Page detail udah pindah ke Sheet Mode B |
| `src/app/[slug]/loading.tsx` | Pasangan page slug, ikut hapus |
| Folder `src/app/[slug]/` (kalau kosong setelah delete 2 file di atas) | Cleanup |
| `src/components/public/tenant-popup.tsx` | Dead code (legacy Leaflet popup) |
| `src/components/public/tenant-detail-header.tsx` | Konten udah migrate ke `TenantPreviewPanel` |
| `src/components/public/tenant-menu-list.tsx` | Konten udah migrate ke `TenantMenuPanel` (versi minimalist) |
| `src/components/public/category-tabs.tsx` | Tabs sekarang inline di `TenantMenuPanel` pakai shadcn Tabs |
| `src/components/public/tenant-detail-panel.tsx` (KALAU ADA dari batch sebelumnya) | Replaced by preview + menu panel pair |

⚠️ **Sebelum hapus, pastikan tidak ada import yang masih reference file-file ini di tempat lain.**

Cek dengan:
```bash
# Cari import yang masih ke file yang akan dihapus
grep -r "tenant-popup\|tenant-detail-header\|tenant-menu-list\|category-tabs" src/
```

Kalau hasil nya cuma di file yang akan dihapus juga (atau gak ada hasil), aman delete.

---

## 🔧 Update `.env.local` Manual

```env
NEXT_PUBLIC_DEFAULT_CITY_LAT=-7.5908
NEXT_PUBLIC_DEFAULT_CITY_LNG=111.5863
NEXT_PUBLIC_DEFAULT_CITY_NAME=Dimong, Madiun
NEXT_PUBLIC_BRAND_NAME=Kuliner Madiun
```

**Restart `pnpm dev`** habis ubah env.

---

## 📦 Dependencies Check

Yang dibutuhin (dari package.json + install belakangan):
- ✅ `@shadcn/sheet`
- ✅ `@shadcn/drawer` (vaul)
- ✅ `react-leaflet-markercluster@5.0.0-rc.0`
- ✅ `leaflet.markercluster@1.5.3`
- ✅ `@/components/ui/tabs` (shadcn tabs, variant "line")

Kalau Tabs belum di-install / belum punya variant line:
```bash
pnpm dlx shadcn@latest add tabs
```

Pastikan `variant="line"` ada di `TabsList` lo. Kalau gak ada (versi shadcn lama), pakai default style aja — tinggal hapus prop `variant="line"` di `tenant-menu-panel.tsx`.

---

## 🎬 Flow UX yang Dihasilkan

```
[User di peta]
   │
   ├── Klik marker
   │      ↓
   │   [Sheet Mode A — Preview]
   │   • Foto warung
   │   • Status & harga range
   │   • Alamat, jumlah menu
   │   • [Lihat Menu] [Hubungi WA]
   │      │
   │      ├── Klik [Lihat Menu]
   │      │      ↓
   │      │   [Sheet Mode B — Menu Lengkap]
   │      │   • Tabs kategori (Semua/Makanan/Minuman/...)
   │      │   • Cards menu minimalist (foto 64px, nama, deskripsi, harga, Pesan)
   │      │   • Sticky bottom: [Hubungi Warung]
   │      │      │
   │      │      ├── Klik [←] back → Mode A
   │      │      ├── Klik [Pesan] item → WA wa.me dengan pre-filled message
   │      │      └── Klik [Hubungi Warung] → WA generic message
   │      │
   │      └── Klik [Hubungi] → WA generic message
   │
   └── Close Sheet / Drawer → Mode auto reset ke "preview"
```

---

## ✅ Testing Checklist

### 1. Font Geist
- Inspect body → `font-family` Geist
- Restart `pnpm dev` after env change

### 2. Brand & Map
- Tulis "Kuliner Madiun"
- Map default di Lapangan Dimong
- Lingkaran amber dashed radius 1km

### 3. Marker & Cluster
- Marker default pin lucide
- Klik → buka Sheet (desktop) atau Drawer (mobile) di Mode A
- Cluster muncul kalau marker rapat → klik → zoom in

### 4. Sheet Mode A (Preview)
- Foto hero + status badge + harga range
- Distance badge muncul kalau "Cari Terdekat" aktif
- Tombol "Lihat Menu" & "Hubungi" muncul
- Klik "Lihat Menu" → **TIDAK navigate keluar peta**, transisi ke Mode B in-place

### 5. Sheet Mode B (Menu Lengkap)
- Header dengan back button "←" di kiri
- "Menu" + counter "X dari Y tersedia"
- Tabs `line` variant — Semua + per kategori dengan icon emoji + badge count
- Tabs sticky saat scroll
- Cards menu: foto 64×64, nama, deskripsi (1 line), harga, tombol "Pesan"
- Item habis → opacity 60% + tombol "Habis" disabled
- Klik "Pesan" → buka wa.me dengan pre-filled message item
- Sticky bottom: tombol "Hubungi Warung" → WA generic
- Klik "←" → balik ke Mode A

### 6. Mode Reset
- Buka warung A, masuk Mode B
- Close Sheet
- Buka warung B (klik marker lain)
- → Harus mulai dari Mode A (preview), bukan langsung Mode B

### 7. Menu Loading State
- First click "Lihat Menu" tenant baru → skeleton loader / "Memuat menu..."
- Second click warung yang sama → instant (cache hit)

### 8. Edge cases
- Warung tanpa menu sama sekali → empty state di Mode B + tombol Hubungi
- Warung tanpa foto → fallback huruf besar + gradient amber
- Warung tanpa deskripsi → skip line tersebut, layout tetap rapi

### 9. Existing features
- Filter kategori sidebar / FAB ✅
- Toggle Buka hari ini ✅
- Cari Terdekat ✅
- Reset filter ✅

---

## ⚠️ Known Caveats & Tips

### A. URL Sharing Hilang
Karena page `/[slug]` dihapus, user gak bisa share link "lihat warung X" langsung. Kalau nanti butuh shareable URL, opsi:
- Bikin lagi `/[slug]/page.tsx` tipis yang Server Component pre-render → di-redirect/auto-trigger Sheet via query param di home (e.g. `/?tenant=warung-x`)
- Atau tambah `?tenant=slug` di home dengan `useSearchParams` → auto-open Sheet untuk warung tsb

Untuk sekarang skip dulu, focus ke UX peta-first.

### B. Cache Menu
File `use-tenant-menu.ts` punya cache module-level (`menuCache` Map). Cache clear otomatis pas full page reload. Kalau admin update menu, user yang lagi browse harus reload untuk lihat update. Acceptable untuk MVP.

Kalau nanti butuh "invalidate cache" (misal pakai Supabase realtime), tinggal expose `menuCache.delete(tenantId)` atau `menuCache.clear()`.

### C. Vaul Drawer + Scroll
Drawer mobile pakai vaul. Saat content scroll di dalam drawer, vaul auto detect dan disable drag-to-dismiss saat scroll aktif. Tabs sticky + sticky bottom WA harusnya feel native.

Kalau ada bug "tab gak sticky" atau "scroll keganggu drag", check `<DrawerContent>` udah punya `max-h-[92svh]` + container scroll punya `overflow-y-auto`.

### D. Tabs Variant "line"
Sesuai contoh yang lo kasih, gua pakai `<TabsList variant="line">`. Kalau shadcn lo belum support `variant` prop di TabsList, fallback: hapus prop variant, default style juga acceptable.
