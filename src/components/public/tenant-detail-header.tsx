import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, MapPin, MessageCircle } from "lucide-react"

import { formatHariLibur } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WaCtaButton } from "./wa-cta-button"
import type { Tenant } from "@/types"

interface TenantDetailHeaderProps {
  tenant: Tenant
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

function getTodayStatus(tenant: Tenant): {
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

/**
 * Hero header untuk detail page warung.
 * Server Component — render statis, data dari props.
 *
 * Layout:
 * - Floating back button top-left
 * - Hero foto (16:10 mobile, 21:9 desktop) dengan gradient overlay bawah
 * - Info card overlap dengan negative margin (sticker-style)
 *   berisi nama, badge status, deskripsi, alamat, jam, hari libur, WA CTA
 */
export function TenantDetailHeader({ tenant }: TenantDetailHeaderProps) {
  const status = getTodayStatus(tenant)
  const hariLiburText = formatHariLibur(
    (tenant.hari_libur ?? []) as string[]
  )

  return (
    <header className="relative">
      {/* Floating back button */}
      <Button
        asChild
        variant="secondary"
        size="sm"
        className="absolute left-3 top-3 z-20 rounded-full bg-background/90 shadow-md backdrop-blur-md hover:bg-background sm:left-6 sm:top-6"
      >
        <Link href="/">
          <ArrowLeft className="size-4" />
          Peta
        </Link>
      </Button>

      {/* Hero foto */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted sm:aspect-[21/9]">
        {tenant.foto_url ? (
          <Image
            src={tenant.foto_url}
            alt={tenant.nama}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-7xl font-bold text-amber-700 sm:text-9xl">
            {tenant.nama.charAt(0)}
          </div>
        )}
        {/* Gradient bawah untuk readability */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Info card overlap */}
      <div className="relative z-10 -mt-10 px-4 sm:-mt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-xl border bg-card p-5 shadow-lg sm:p-6">
          {/* Title + status */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {tenant.nama}
            </h1>
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
          </div>

          {/* Deskripsi */}
          {tenant.deskripsi ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {tenant.deskripsi}
            </p>
          ) : null}

          {/* Meta */}
          <dl className="mt-5 space-y-2.5 text-sm">
            {tenant.alamat ? (
              <div className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <dd className="text-foreground">{tenant.alamat}</dd>
              </div>
            ) : null}

            <div className="flex items-start gap-2.5">
              <Clock
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <dd className="text-foreground">
                {tenant.jam_buka ? (
                  <>
                    <span className="font-medium">{tenant.jam_buka}</span>
                    <span className="text-muted-foreground"> · </span>
                  </>
                ) : null}
                <span className="text-muted-foreground">{hariLiburText}</span>
              </dd>
            </div>
          </dl>

          {/* CTA WhatsApp */}
          <div className="mt-5 border-t pt-5">
            <WaCtaButton
              nomorWa={tenant.nomor_wa}
              message={`Halo ${tenant.nama}! Saya mau tanya tentang menu yang tersedia hari ini.`}
              size="lg"
              className="w-full sm:w-auto"
            >
              <MessageCircle className="size-4" />
              Hubungi via WhatsApp
            </WaCtaButton>
            <p className="mt-2 text-xs text-muted-foreground">
              Atau klik tombol "Pesan" di setiap menu di bawah untuk pesan
              langsung item tertentu.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
