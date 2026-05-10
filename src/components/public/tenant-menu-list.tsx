"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { MessageCircle, Utensils } from "lucide-react"

import { formatRupiah } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CategoryTabs } from "./category-tabs"
import { WaCtaButton } from "./wa-cta-button"
import type { Category, ProductWithCategory, Tenant } from "@/types"

interface TenantMenuListProps {
  products: ProductWithCategory[]
  /** Hanya kategori yang punya produk di tenant ini */
  categories: Category[]
  tenant: Pick<Tenant, "nama" | "nomor_wa">
}

/**
 * Daftar menu warung dengan filter tabs per kategori.
 * Tampilan:
 * - Semua aktif → grouping per kategori (with section header)
 * - Filter aktif → flat list 1 kategori
 * - Item tidak tersedia → opacity-60 + tombol "Habis" (disabled)
 */
export function TenantMenuList({
  products,
  categories,
  tenant,
}: TenantMenuListProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )

  // Counts per kategori (untuk tab badges)
  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const cat of categories) {
      m[cat.id] = products.filter((p) => p.category_id === cat.id).length
    }
    return m
  }, [products, categories])

  // Filtered + grouped products
  const groups = useMemo(() => {
    if (selectedCategoryId) {
      const cat = categories.find((c) => c.id === selectedCategoryId)
      if (!cat) return []
      return [
        {
          category: cat,
          items: products.filter((p) => p.category_id === selectedCategoryId),
        },
      ]
    }
    return categories
      .map((cat) => ({
        category: cat,
        items: products.filter((p) => p.category_id === cat.id),
      }))
      .filter((g) => g.items.length > 0)
  }, [products, categories, selectedCategoryId])

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0)
  const availableTotal = products.filter((p) => p.is_available).length

  // Empty: tenant punya 0 menu sama sekali
  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold sm:text-2xl">Menu</h2>
        <div className="mt-6 rounded-lg border border-dashed bg-muted/30 p-8 text-center">
          <Utensils
            className="mx-auto mb-3 size-10 text-muted-foreground/50"
            aria-hidden
          />
          <p className="text-sm font-medium">Belum ada menu tercantum</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hubungi langsung warung untuk tanya menu yang tersedia.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Section header */}
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold sm:text-2xl">Menu</h2>
        <p className="text-sm tabular-nums text-muted-foreground">
          {availableTotal} dari {products.length} tersedia
        </p>
      </div>

      {/* Tabs (skip kalau cuma 1 kategori) */}
      {categories.length > 1 ? (
        <div className="mt-4">
          <CategoryTabs
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            counts={counts}
            totalCount={products.length}
          />
        </div>
      ) : null}

      {/* List */}
      {totalItems === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-muted/30 p-8 text-center">
          <p className="text-sm font-medium">
            Belum ada menu di kategori ini
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map((group) => (
            <div key={group.category.id}>
              {/* Section title (skip kalau cuma 1 group / filter aktif) */}
              {!selectedCategoryId && groups.length > 1 ? (
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className="text-base" aria-hidden>
                    {group.category.icon}
                  </span>
                  {group.category.nama}
                  <span className="font-normal lowercase tracking-normal">
                    · {group.items.length} item
                  </span>
                </h3>
              ) : null}

              <ul className="space-y-3">
                {group.items.map((p) => (
                  <ProductMenuItem
                    key={p.id}
                    product={p}
                    tenantNama={tenant.nama}
                    tenantNomorWa={tenant.nomor_wa}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ---------- ProductMenuItem (sub-component, inline) ----------

interface ProductMenuItemProps {
  product: ProductWithCategory
  tenantNama: string
  tenantNomorWa: string
}

function ProductMenuItem({
  product,
  tenantNama,
  tenantNomorWa,
}: ProductMenuItemProps) {
  const isAvailable = product.is_available

  // Pre-filled WhatsApp message
  const message = [
    `Halo ${tenantNama}!`,
    `Saya mau pesan:`,
    `*${product.nama}* — ${formatRupiah(product.harga)}`,
    ``,
    `Apakah masih tersedia?`,
  ].join("\n")

  return (
    <li
      className={cn(
        "flex gap-3 rounded-lg border bg-card p-3 transition-colors sm:gap-4 sm:p-4",
        !isAvailable && "opacity-60"
      )}
    >
      {/* Foto */}
      <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:size-24">
        {product.foto_url ? (
          <Image
            src={product.foto_url}
            alt={product.nama}
            fill
            sizes="(max-width: 640px) 80px, 96px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-3xl">
            {product.category.icon}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1">
          <h4 className="font-medium leading-tight">{product.nama}</h4>
          {product.deskripsi ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {product.deskripsi}
            </p>
          ) : null}
        </div>

        {/* Footer: harga + CTA */}
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-base font-bold tabular-nums sm:text-lg">
              {formatRupiah(product.harga)}
            </p>
            {!isAvailable ? (
              <p className="text-xs font-medium text-destructive">
                Sedang habis
              </p>
            ) : null}
          </div>

          {isAvailable ? (
            <WaCtaButton
              nomorWa={tenantNomorWa}
              message={message}
              size="sm"
            >
              <MessageCircle className="size-3.5" />
              Pesan
            </WaCtaButton>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Habis
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}
