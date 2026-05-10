import { createClient } from "@/lib/supabase/server"
import { BRAND_NAME, TAGLINE, DEFAULT_CITY_NAME } from "@/lib/constants"
import { TenantMapView } from "@/components/public/tenant-map-view"
import type { TenantWithProducts } from "@/hooks/use-tenants"

export const metadata = {
  title: `${BRAND_NAME} — ${TAGLINE}`,
  description: `Direktori warung & PKL di ${DEFAULT_CITY_NAME}. Klik marker, pesan via WhatsApp, datang langsung. Bukan yang paling besar — tapi yang paling mudah ditemukan.`,
}

// Revalidate setiap 60 detik supaya update admin cepat tampil di publik
// tanpa hard cache. Bisa diturunkan ke 30s atau dinaikan ke 300s sesuai kebutuhan.
export const revalidate = 60

export default async function PublicMapPage() {
  const supabase = await createClient()

  const [tenantsRes, categoriesRes] = await Promise.all([
    // Fetch active tenants + product summary (id, kategori, harga, availability)
    // Cuma kolom yang kepake untuk filter + harga range, bukan full menu.
    supabase
      .from("tenants")
      .select(
        `
        *,
        products(id, category_id, harga, is_available)
      `
      )
      .eq("is_active", true)
      .order("nama", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .order("urutan", { ascending: true }),
  ])

  const tenants = (tenantsRes.data ?? []) as unknown as TenantWithProducts[]
  const categories = categoriesRes.data ?? []

  return (
    <TenantMapView
      initialTenants={tenants}
      initialCategories={categories}
    />
  )
}
