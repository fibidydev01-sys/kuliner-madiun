/**
 * Konstanta global app.
 * Default-nya diset ke Desa Dimong, Madiun (scope MVP).
 * Override via env vars di .env.local.
 */

// ---------- Brand identity ----------

export const BRAND_NAME =
  process.env.NEXT_PUBLIC_BRAND_NAME || "FoodMap Madiun"

export const TAGLINE = "Temukan. Pesan. Datang."

export const SUB_TAGLINE =
  "Bukan yang paling besar. Tapi yang paling mudah ditemukan."

export const APP_DESCRIPTION =
  "Direktori PKL & warung kaki lima ber-spot tetap. Peta interaktif, menu transparan, pesan langsung via WhatsApp."

// ---------- Geografis (default) ----------

/**
 * Pusat default peta = Desa Dimong, Kec. Madiun, Kab. Madiun.
 * Refine pakai LocationPicker di admin setelah survey lapangan.
 */
export const DEFAULT_CENTER: [number, number] = [
  Number(process.env.NEXT_PUBLIC_DEFAULT_CITY_LAT) || -7.565,
  Number(process.env.NEXT_PUBLIC_DEFAULT_CITY_LNG) || 111.532,
]

export const DEFAULT_CITY_NAME =
  process.env.NEXT_PUBLIC_DEFAULT_CITY_NAME || "Dimong, Madiun"

// ---------- Map config ----------

export const DEFAULT_ZOOM = 16 // skala desa/kecamatan, marker keliatan rapat
export const MIN_ZOOM = 12
export const MAX_ZOOM = 19

/**
 * Radius default buat query "tenant terdekat".
 * 5km = jangkauan motor pendek di skala desa/kecamatan.
 */
export const NEARBY_RADIUS_KM = 5

// ---------- Kategori ----------

export const CATEGORIES = {
  MAKANAN: "Makanan",
  MINUMAN: "Minuman",
} as const

export type CategoryName = (typeof CATEGORIES)[keyof typeof CATEGORIES]

export const CATEGORY_ICONS: Record<CategoryName, string> = {
  Makanan: "🍽️",
  Minuman: "🥤",
}

export type CategoryFilter = "Semua" | CategoryName

export const CATEGORY_FILTERS: CategoryFilter[] = [
  "Semua",
  "Makanan",
  "Minuman",
]

// ---------- Hari ----------

export const DAYS_OF_WEEK = [
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
  "minggu",
] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

// ---------- Cloudinary ----------

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""

export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "foodmap_unsigned"

export const CLOUDINARY_FOLDER = "foodmap"
