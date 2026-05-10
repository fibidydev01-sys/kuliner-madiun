"use client"

import { useCallback, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { NEARBY_RADIUS_KM } from "@/lib/constants"

export type NearbyResult = {
  /** Tenant IDs ordered by distance ascending — null kalau belum pernah search */
  orderedIds: string[] | null
  /** Map tenant_id → meters distance untuk display */
  distances: Map<string, number>
  /** Lat/lng user — null kalau belum pernah granted */
  userLocation: { latitude: number; longitude: number } | null
}

interface UseNearbyTenantsResult extends NearbyResult {
  isLocating: boolean
  error: string | null
  /** Trigger geolocation request + RPC call */
  findNearby: () => Promise<void>
  /** Clear nearby state — kembali ke "show all" */
  reset: () => void
}

const INITIAL: NearbyResult = {
  orderedIds: null,
  distances: new Map(),
  userLocation: null,
}

/** Shape baris dari RPC nearby_tenants — sesuai Database.public.Functions.Returns */
type NearbyRow = {
  id: string
  dist_meters: number | null
  // field lain (nama, foto_url, dll) ada di Returns tapi tidak dipakai di hook ini
}

/**
 * Hook untuk fitur "Cari Terdekat":
 * 1. Request browser geolocation
 * 2. Call Supabase RPC `nearby_tenants(lat, lng, radius_km)`
 * 3. Return ordered IDs + distance map untuk display
 *
 * @example
 * const nearby = useNearbyTenants()
 * <Button onClick={nearby.findNearby} disabled={nearby.isLocating}>
 *   Cari Terdekat
 * </Button>
 */
export function useNearbyTenants(): UseNearbyTenantsResult {
  const [state, setState] = useState<NearbyResult>(INITIAL)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const findNearby = useCallback(async () => {
    setError(null)

    // 1. Geolocation support check
    if (!("geolocation" in navigator)) {
      setError("Browser tidak mendukung geolokasi")
      return
    }

    setIsLocating(true)

    try {
      // 2. Request user location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10_000,
            maximumAge: 60_000,
          })
        }
      )

      const lat = position.coords.latitude
      const lng = position.coords.longitude

      // 3. Call RPC nearby_tenants
      // Sebelum `pnpm types:gen` dijalankan, Database stub belum punya RPC
      // arg signature yang ramah typecheck. Cast via unknown supaya tidak
      // perlu nunggu real types — setelah types:gen, biasanya cast otomatis
      // bisa dihapus dan typing tetap valid.
      const supabase = createClient()
      const rpcCall = supabase.rpc as unknown as (
        fn: "nearby_tenants",
        args: { user_lat: number; user_lng: number; radius_km: number }
      ) => Promise<{
        data: NearbyRow[] | null
        error: { message: string } | null
      }>

      const { data, error: rpcError } = await rpcCall("nearby_tenants", {
        user_lat: lat,
        user_lng: lng,
        radius_km: NEARBY_RADIUS_KM,
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      // 4. Build ordered IDs + distance map
      const rows: NearbyRow[] = data ?? []
      const orderedIds = rows.map((t) => t.id)
      const distances = new Map<string, number>()
      for (const t of rows) {
        distances.set(t.id, t.dist_meters ?? 0)
      }

      setState({
        orderedIds,
        distances,
        userLocation: { latitude: lat, longitude: lng },
      })
    } catch (err) {
      // Geolocation errors
      if (
        typeof GeolocationPositionError !== "undefined" &&
        err instanceof GeolocationPositionError
      ) {
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            "Akses lokasi ditolak. Aktifkan di pengaturan browser untuk pakai fitur ini."
          )
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError(
            "Lokasi tidak tersedia. Coba di tempat dengan sinyal GPS lebih baik."
          )
        } else if (err.code === err.TIMEOUT) {
          setError("Pencarian lokasi terlalu lama. Coba lagi.")
        } else {
          setError("Gagal mendapatkan lokasi.")
        }
      } else {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan tak terduga"
        )
      }
    } finally {
      setIsLocating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setState(INITIAL)
    setError(null)
  }, [])

  return {
    ...state,
    isLocating,
    error,
    findNearby,
    reset,
  }
}