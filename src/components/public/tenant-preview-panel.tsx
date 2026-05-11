"use client"

import Image from "next/image"
import {
  ArrowRight,
  Clock,
  Locate,
  MapPin,
  MessageCircle,
  Utensils,
} from "lucide-react"

import { formatJarak, formatRupiah } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WaCtaButton } from "./wa-cta-button"
import type { TenantWithProducts } from "@/hooks/use-tenants"

interface TenantPreviewPanelProps {
  tenant: TenantWithProducts
  distanceMeters?: number | null
  /** Trigger transisi ke Mode B (menu lengkap dalam Sheet) */
  onShowMenu: () => void
}

const HARI_LIBUR_DAYS = [
  "minggu",
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
] as const

function getTodayStatus(tenant: TenantWithProducts): {
  label: string
  isClosed: boolean
} {
  const today = HARI_LIBUR_DAYS[new Date().getDay()]
  const hariLibur = (tenant.hari_libur ?? []) as string[]
  if (hariLibur.includes(today)) {
    return { label: "Libur hari ini", isClosed: true }
  }
  return {
    label: tenant.jam_buka ? `Buka · ${tenant.jam_buka}` : "Buka hari ini",
    isClosed: false,
  }
}

function getPriceRange(tenant: TenantWithProducts): string | null {
  const available = tenant.products.filter((p) => p.is_available)
  if (available.length === 0) return null
  const prices = available.map((p) => Number(p.harga))
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return formatRupiah(min)
  return `${formatRupiah(min)} – ${formatRupiah(max)}`
}

/**
 * Mode A — Preview ringkas saat marker di-klik.
 *
 * Konten:
 * - Hero foto warung
 * - Badge status (buka/libur) + harga range
 * - Deskripsi (kalau ada)
 * - Meta: alamat, jumlah menu tersedia
 * - CTAs: "Lihat Menu" (→ Mode B, in-place) + "Hubungi" (→ WA external)
 *
 * @note Tombol "Lihat Menu" TIDAK navigate ke /[slug]. Stay di Sheet,
 * trigger onShowMenu untuk switch ke Mode B di container yang sama.
 */
export function TenantPreviewPanel({
  tenant,
  distanceMeters = null,
  onShowMenu,
}: TenantPreviewPanelProps) {
  const status = getTodayStatus(tenant)
  const priceRange = getPriceRange(tenant)
  const availableCount = tenant.products.filter((p) => p.is_available).length

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2 sm:px-6">
      {/* Hero foto */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
        {tenant.foto_url ? (
          <Image
            src={tenant.foto_url}
            alt={tenant.nama}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-6xl font-bold text-amber-700">
            {tenant.nama.charAt(0)}
          </div>
        )}

        {distanceMeters !== null ? (
          <div className="absolute right-3 top-3">
            <Badge className="gap-1 bg-amber-600 text-white shadow-md hover:bg-amber-600">
              <Locate className="size-3" aria-hidden />
              {formatJarak(distanceMeters)}
            </Badge>
          </div>
        ) : null}
      </div>

      {/* Status + price */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={status.isClosed ? "secondary" : "default"}
          className={cn(
            "font-normal",
            !status.isClosed &&
              "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20"
          )}
        >
          <Clock className="size-3" aria-hidden />
          {status.label}
        </Badge>
        {priceRange ? (
          <span className="text-sm font-semibold text-foreground">
            {priceRange}
          </span>
        ) : null}
      </div>

      {/* Deskripsi */}
      {tenant.deskripsi ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {tenant.deskripsi}
        </p>
      ) : null}

      {/* Meta list */}
      <dl className="space-y-2 text-sm">
        {tenant.alamat ? (
          <div className="flex items-start gap-2.5">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <dd className="text-foreground">{tenant.alamat}</dd>
          </div>
        ) : null}

        {availableCount > 0 ? (
          <div className="flex items-start gap-2.5">
            <Utensils
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <dd className="text-foreground">
              {availableCount} menu tersedia
            </dd>
          </div>
        ) : null}
      </dl>

      {/* CTAs */}
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onShowMenu} className="flex-1">
          Lihat Menu
          <ArrowRight className="size-4" />
        </Button>
        <WaCtaButton
          nomorWa={tenant.nomor_wa}
          message={`Halo ${tenant.nama}! Saya mau tanya tentang menu yang tersedia.`}
          className="flex-1"
        >
          <MessageCircle className="size-4" />
          Hubungi
        </WaCtaButton>
      </div>
    </div>
  )
}
