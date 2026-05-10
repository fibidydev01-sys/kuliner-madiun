import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { createClient } from "@/lib/supabase/server"
import { BRAND_NAME } from "@/lib/constants"
import { TenantDetailHeader } from "@/components/public/tenant-detail-header"
import { TenantMenuList } from "@/components/public/tenant-menu-list"

// ISR — refresh setiap 60s, sama dengan homepage
export const revalidate = 60

interface RouteParams {
  params: Promise<{ slug: string }>
}

// ---------- Metadata (SEO) ----------

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("nama, deskripsi, foto_url, alamat")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!tenant) {
    return { title: "Warung tidak ditemukan" }
  }

  const description =
    tenant.deskripsi ??
    `Lihat menu dan kontak ${tenant.nama}${
      tenant.alamat ? ` di ${tenant.alamat}` : ""
    }. Pesan langsung via WhatsApp.`

  return {
    title: `${tenant.nama} — ${BRAND_NAME}`,
    description,
    openGraph: tenant.foto_url
      ? {
          title: tenant.nama,
          description,
          images: [{ url: tenant.foto_url, alt: tenant.nama }],
          type: "website",
        }
      : { title: tenant.nama, description, type: "website" },
    twitter: tenant.foto_url
      ? {
          card: "summary_large_image",
          title: tenant.nama,
          description,
          images: [tenant.foto_url],
        }
      : { card: "summary", title: tenant.nama, description },
  }
}

// ---------- Page ----------

export default async function TenantDetailPage({ params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()

  const [tenantRes, allCategoriesRes] = await Promise.all([
    supabase
      .from("tenants")
      .select(
        `
        *,
        products(
          *,
          category:categories(id, nama, icon, urutan, created_at)
        )
      `
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single(),
    supabase
      .from("categories")
      .select("*")
      .order("urutan", { ascending: true }),
  ])

  if (!tenantRes.data) notFound()

  const tenant = tenantRes.data
  const allCategories = allCategoriesRes.data ?? []

  // Filter ke kategori yang punya produk di tenant ini saja —
  // supaya tabs ga show kategori kosong (UX cleaner)
  const tenantCategories = allCategories.filter((cat) =>
    tenant.products?.some((p) => p.category_id === cat.id)
  )

  // Sort produk: tersedia dulu, lalu by harga ascending
  const sortedProducts = [...(tenant.products ?? [])].sort((a, b) => {
    if (a.is_available !== b.is_available) {
      return a.is_available ? -1 : 1
    }
    return Number(a.harga) - Number(b.harga)
  })

  return (
    <main className="min-h-svh bg-muted/20 pb-12">
      <TenantDetailHeader tenant={tenant} />
      <TenantMenuList
        products={sortedProducts}
        categories={tenantCategories}
        tenant={{ nama: tenant.nama, nomor_wa: tenant.nomor_wa }}
      />
    </main>
  )
}
