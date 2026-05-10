"use client"

import { useEffect } from "react"
import { Loader2, Locate, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { useNearbyTenants } from "@/hooks/use-nearby-tenants"

interface NearbyButtonProps {
  /** State + actions dari useNearbyTenants() yang dipassed dari parent */
  nearby: ReturnType<typeof useNearbyTenants>
  className?: string
}

/**
 * Tombol "Cari Terdekat" — request geolocation user + sort warung by jarak.
 *
 * Tampilan:
 * - Default: <Locate /> "Cari Terdekat"
 * - Loading: <Loader2 spin /> "Mencari lokasi..."
 * - Active (sudah dapat hasil): badge dengan jumlah hasil + tombol X untuk reset
 *
 * Error toast otomatis muncul kalau geolocation ditolak / timeout.
 */
export function NearbyButton({ nearby, className }: NearbyButtonProps) {
  // Toast error dari hook
  useEffect(() => {
    if (nearby.error) {
      toast.error("Tidak bisa mencari terdekat", {
        description: nearby.error,
      })
    }
  }, [nearby.error])

  const isActive =
    nearby.orderedIds !== null && nearby.orderedIds.length >= 0

  // State: sudah dapat hasil → tampilkan badge dengan tombol reset
  if (isActive) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Badge
          variant="default"
          className="h-9 gap-1.5 px-3 text-sm font-medium"
        >
          <Locate className="size-3.5" aria-hidden />
          {nearby.orderedIds!.length > 0
            ? `${nearby.orderedIds!.length} warung terdekat`
            : "Tidak ada warung dekat"}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={nearby.reset}
          aria-label="Tampilkan semua warung lagi"
          className="size-9"
        >
          <X className="size-4" />
        </Button>
      </div>
    )
  }

  // State: idle / loading
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={nearby.findNearby}
      disabled={nearby.isLocating}
      className={cn("h-9", className)}
    >
      {nearby.isLocating ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Mencari lokasi...
        </>
      ) : (
        <>
          <Locate className="size-4" />
          Cari Terdekat
        </>
      )}
    </Button>
  )
}
