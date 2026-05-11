"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Loader2, MessageCircle, Store, Utensils } from "lucide-react"

import { formatRupiah } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useTenantMenu } from "@/hooks/use-tenant-menu"
import { WaCtaButton } from "./wa-cta-button"
import type { ProductWithCategory } from "@/types"
import type { TenantWithProducts } from "@/hooks/use-tenants"

interface TenantMenuPanelProps {
  tenant: TenantWithProducts
}

const ALL_TAB_VALUE = "__all__"

/**
 * Mode B — Menu lengkap warung, dalam Sheet/Drawer (no page navigation).
 *
 * Layout:
 * - Tabs kategori (sticky di atas) — variant "line"
 * - List menu grouped per kategori (kalau tab = All) atau flat (kalau filter)
 * - Sticky WA CTA di bawah (always accessible, gak terlepas sambil scroll)
 *
 * Data fetched lazy via useTenantMenu (cache per tenant id).
 */
export function TenantMenuPanel({ tenant }: TenantMenuPanelProps) {
  const { products, isLoading, error } = useTenantMenu(tenant.id)
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB_VALUE)

  // Categories yang punya produk di tenant ini (skip kategori kosong)
  const categories = useMemo(() => {
    const seen = new globalThis.Map<
      string,
      { id: string; nama: string; icon: string | null; count: number }
    >()
    for (const p of products) {
      const existing = seen.get(p.category_id)
      if (existing) {
        existing.count += 1
      } else {
        seen.set(p.category_id, {
          id: p.category_id,
          nama: p.category?.nama ?? "—",
          icon: p.category?.icon ?? null,
          count: 1,
        })
      }
    }
    return Array.from(seen.values())
  }, [products])

  const availableTotal = products.filter((p) => p.is_available).length
  const totalCount = products.length

  // Filtered & grouped products untuk display
  const groups = useMemo(() => {
    if (activeTab !== ALL_TAB_VALUE) {
      const items = products.filter((p) => p.category_id === activeTab)
      const cat = categories.find((c) => c.id === activeTab)
      if (!cat) return []
      return [{ id: cat.id, nama: cat.nama, icon: cat.icon, items }]
    }
    return categories
      .map((cat) => ({
        id: cat.id,
        nama: cat.nama,
        icon: cat.icon,
        items: products.filter((p) => p.category_id === cat.id),
      }))
      .filter((g) => g.items.length > 0)
  }, [products, categories, activeTab])

  // ---------- Render states ----------

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
        <Loader2
          className="size-6 animate-spin text-muted-foreground"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Memuat menu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <p className="text-sm font-medium">Gagal memuat menu</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
        <Utensils
          className="size-10 text-muted-foreground/50"
          aria-hidden
        />
        <p className="text-sm font-medium">Belum ada menu tercantum</p>
        <p className="text-xs text-muted-foreground">
          Hubungi langsung warung untuk tanya menu yang tersedia.
        </p>
        <WaCtaButton
          nomorWa={tenant.nomor_wa}
          message={`Halo ${tenant.nama}! Saya mau tanya tentang menu yang tersedia.`}
          size="sm"
          className="mt-2"
        >
          <MessageCircle className="size-4" />
          Hubungi
        </WaCtaButton>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Section header — "Menu" + counter */}
      <div className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-1 sm:px-6">
        <h3 className="text-xl font-bold tracking-tight">Menu</h3>
        <p className="text-sm tabular-nums text-muted-foreground">
          {availableTotal} dari {totalCount} tersedia
        </p>
      </div>

      {/* Tabs sticky — variant line */}
      <div className="sticky top-0 z-10 -mx-px border-b bg-background/95 px-4 pb-2 backdrop-blur-md sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value={ALL_TAB_VALUE} className="gap-1.5">
              <Store className="size-3.5" aria-hidden />
              Semua
              <CountBadge count={totalCount} active={activeTab === ALL_TAB_VALUE} />
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-1.5">
                {cat.icon ? <span aria-hidden>{cat.icon}</span> : null}
                {cat.nama}
                <CountBadge
                  count={cat.count}
                  active={activeTab === cat.id}
                />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Menu list — grouped */}
      <div className="space-y-6 px-4 py-4 pb-32 sm:px-6">
        {groups.map((group) => (
          <section key={group.id}>
            {/* Section title (skip header kalau filter tab aktif) */}
            {activeTab === ALL_TAB_VALUE ? (
              <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.icon ? (
                  <span className="text-base" aria-hidden>
                    {group.icon}
                  </span>
                ) : null}
                {group.nama}
                <span className="font-normal lowercase tracking-normal">
                  · {group.items.length} item
                </span>
              </h4>
            ) : null}

            <ul className="space-y-2.5">
              {group.items.map((p) => (
                <MenuCard
                  key={p.id}
                  product={p}
                  tenantNama={tenant.nama}
                  tenantNomorWa={tenant.nomor_wa}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Sticky bottom WA CTA */}
      <div
        className="sticky bottom-0 border-t bg-background/95 px-4 py-3 backdrop-blur-md sm:px-6"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <WaCtaButton
          nomorWa={tenant.nomor_wa}
          message={`Halo ${tenant.nama}! Saya mau tanya tentang menu yang tersedia.`}
          className="w-full"
          size="lg"
        >
          <MessageCircle className="size-4" />
          Hubungi Warung
        </WaCtaButton>
      </div>
    </div>
  )
}

// ---------- Sub-components (inline) ----------

function CountBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <Badge
      variant={active ? "default" : "secondary"}
      className={cn(
        "h-4 min-w-4 px-1 text-[10px] font-semibold tabular-nums",
        active && "bg-foreground text-background"
      )}
    >
      {count}
    </Badge>
  )
}

interface MenuCardProps {
  product: ProductWithCategory
  tenantNama: string
  tenantNomorWa: string
}

/**
 * Minimalist card — Level 2 (balanced):
 * - Foto 56x56 kiri
 * - Nama + deskripsi 1 line truncated
 * - Harga + "Pesan" button kanan-bawah
 * - Habis state: opacity 60% + button "Habis" disabled
 */
function MenuCard({ product, tenantNama, tenantNomorWa }: MenuCardProps) {
  const isAvailable = product.is_available

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
        "flex items-stretch gap-3 rounded-lg border bg-card p-2.5 transition-colors",
        !isAvailable && "opacity-60"
      )}
    >
      {/* Foto */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {product.foto_url ? (
          <Image
            src={product.foto_url}
            alt={product.nama}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-2xl">
            {product.category?.icon ?? "🍽️"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
        {/* Top: nama + deskripsi */}
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-semibold leading-tight">
            {product.nama}
          </p>
          {product.deskripsi ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {product.deskripsi}
            </p>
          ) : null}
        </div>

        {/* Bottom: harga + CTA */}
        <div className="flex items-end justify-between gap-2">
          <p className="text-sm font-bold tabular-nums">
            {formatRupiah(product.harga)}
          </p>
          {isAvailable ? (
            <WaCtaButton
              nomorWa={tenantNomorWa}
              message={message}
              size="sm"
              className="h-7 px-2.5 text-xs"
            >
              <MessageCircle className="size-3" />
              Pesan
            </WaCtaButton>
          ) : (
            <Button size="sm" variant="secondary" disabled className="h-7 px-2.5 text-xs">
              Habis
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}
