import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ProductTable } from "@/components/admin/product-table"
import { ProductFormDialog } from "@/components/admin/product-form"

export const metadata = { title: "Menu Warung" }

export default async function TenantProductsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [tenantRes, productsRes, categoriesRes] = await Promise.all([
    supabase.from("tenants").select("id, nama").eq("id", id).single(),
    supabase
      .from("products")
      .select("*, category:categories(id, nama, icon, urutan, created_at)")
      .eq("tenant_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("urutan"),
  ])

  if (!tenantRes.data) notFound()

  const tenant = tenantRes.data
  const products = productsRes.data ?? []
  const categories = categoriesRes.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/admin/tenants">
            <ArrowLeft className="size-4" />
            Semua Warung
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Menu Warung</h1>
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {tenant.nama} · {products.length} menu
              {products.length > 0 ? (
                <>
                  {" · "}
                  {products.filter((p) => p.is_available).length} tersedia
                </>
              ) : null}
            </p>
          </div>

          {categories.length > 0 ? (
            <ProductFormDialog
              tenantId={tenant.id}
              categories={categories}
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Tambah Menu
                </Button>
              }
            />
          ) : (
            <Button asChild variant="outline">
              <Link href="/admin/categories">Buat kategori dulu</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <ProductTable
          products={products}
          tenantId={tenant.id}
          categories={categories}
        />
      </div>
    </div>
  )
}
