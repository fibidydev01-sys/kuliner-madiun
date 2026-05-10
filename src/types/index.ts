import type { Database } from "./database"

// ---------- Base table types ----------

export type Tenant = Database["public"]["Tables"]["tenants"]["Row"]
export type TenantInsert = Database["public"]["Tables"]["tenants"]["Insert"]
export type TenantUpdate = Database["public"]["Tables"]["tenants"]["Update"]

export type Product = Database["public"]["Tables"]["products"]["Row"]
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"]

export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"]
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"]

// ---------- Composed types ----------

/**
 * Product + relasi kategori (untuk render di UI).
 * Dipakai di product-card, product-list.
 */
export type ProductWithCategory = Product & {
  category: Pick<Category, "id" | "nama" | "icon">
}

/**
 * Tenant + semua produknya (untuk halaman detail).
 */
export type TenantWithProducts = Tenant & {
  products: ProductWithCategory[]
}

/**
 * Tenant + ringkasan jumlah produk (untuk admin table).
 */
export type TenantWithProductCount = Tenant & {
  product_count: number
}

// ---------- RPC return types ----------

/**
 * Return dari Supabase RPC `nearby_tenants(user_lat, user_lng, radius_km)`.
 * Sort by distance ascending.
 */
export type NearbyTenant = {
  id: string
  nama: string
  foto_url: string | null
  nomor_wa: string
  latitude: number
  longitude: number
  alamat: string | null
  jam_buka: string | null
  rating: number | null
  dist_meters: number
}

/**
 * Return dari Supabase RPC `tenants_in_view(bbox)`.
 * Lightweight — hanya field yang dibutuhkan marker peta.
 */
export type TenantInView = {
  id: string
  nama: string
  foto_url: string | null
  nomor_wa: string
  latitude: number
  longitude: number
}

// ---------- Filter & UI types ----------

export type CategoryFilter = "Semua" | "Makanan" | "Minuman"

export type SortOption = "nearest" | "rating" | "newest" | "name"

// ---------- Form / mutation types ----------

/**
 * Payload form tenant (sebelum lat/lng + foto upload).
 * Foto upload diproses terpisah, hasilkan { foto_url, foto_public_id }.
 */
export type TenantFormValues = Omit<
  TenantInsert,
  "id" | "created_at" | "updated_at" | "foto_url" | "foto_public_id"
> & {
  foto?: File | null
}

export type ProductFormValues = Omit<
  ProductInsert,
  "id" | "created_at" | "updated_at" | "foto_url" | "foto_public_id"
> & {
  foto?: File | null
}

export type CategoryFormValues = Omit<
  CategoryInsert,
  "id" | "created_at"
>

// ---------- Cloudinary upload result ----------

export type CloudinaryUploadResult = {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  resource_type: string
  bytes: number
}

// ---------- Geo types ----------

export type LatLng = [number, number]

export type MapBounds = {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
}
