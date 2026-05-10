"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock, Locate, Utensils } from "lucide-react"

import { formatJarak, formatRupiah } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TenantWithProducts } from "@/hooks/use-tenants"

interface TenantPopupProps {
  tenant: TenantWithProducts
  /** Jarak dari user dalam meter — null kalau tidak pakai fitur "Cari Terdekat" */
  distanceMeters?: number | null
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

export function TenantPopup({
  tenant,
  distanceMeters = null,
}: TenantPopupProps) {
  const status = getTodayStatus(tenant)
  const priceRange = getPriceRange(tenant)
  const availableCount = tenant.products.filter((p) => p.is_available).length

  return (
    <div className="w-[260px] -my-2">
      {/* Foto */}
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
        {tenant.foto_url ? (
          <Image
            src={tenant.foto_url}
            alt={tenant.nama}
            fill
            sizes="260px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-3xl font-bold text-muted-foreground">
            {tenant.nama.charAt(0)}
          </div>
        )}

        {/* Distance badge (top-right kalau nearby aktif) */}
        {distanceMeters !== null ? (
          <div className="absolute right-2 top-2">
            <Badge className="gap-1 bg-amber-600 text-white hover:bg-amber-600">
              <Locate className="size-3" aria-hidden />
              {formatJarak(distanceMeters)}
            </Badge>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="mt-3 space-y-2">
        <div>
          <h3 className="text-base font-bold leading-tight">{tenant.nama}</h3>
          {tenant.alamat ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {tenant.alamat}
            </p>
          ) : null}
        </div>

        {/* Status */}
        <Badge
          variant={status.isClosed ? "secondary" : "default"}
          className={cn(
            "font-normal",
            !status.isClosed &&
            "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20"
          )}
        >
          <Clock className="size-3" /> {status.label}
        </Badge>

        {/* Price + count */}
        {(priceRange || availableCount > 0) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {priceRange ? (
              <span className="font-semibold text-foreground">
                {priceRange}
              </span>
            ) : null}
            {availableCount > 0 ? (
              <span className="flex items-center gap-1">
                <Utensils className="size-3" />
                {availableCount} menu
              </span>
            ) : null}
          </div>
        )}

        {/* Action */}
        <Button asChild size="sm" className="w-full">
          <Link href={`/${tenant.slug}`}>
            Lihat Menu
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>
    </div>
  )
}