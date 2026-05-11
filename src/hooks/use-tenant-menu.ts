"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ProductWithCategory } from "@/types"

interface UseTenantMenuResult {
  products: ProductWithCategory[]
  isLoading: boolean
  error: string | null
}

/**
 * Module-level cache (in-memory, per session).
 *
 * Sengaja module-scope (bukan state) supaya kalau user balik ke warung yang
 * pernah dibuka, render instant tanpa refetch. Clear otomatis saat full reload.
 */
const menuCache: globalThis.Map<string, ProductWithCategory[]> = new globalThis.Map()

/**
 * Lazy fetch full menu tenant.
 *
 * Dipanggil hanya saat Sheet/Drawer masuk Mode B (lihat menu lengkap),
 * supaya page load awal tetap ringan (cuma fetch summary id+kategori+harga).
 *
 * @param tenantId - id tenant, atau null kalau belum select / Mode A
 *
 * @example
 * const { products, isLoading } = useTenantMenu(activeTenantId)
 */
export function useTenantMenu(tenantId: string | null): UseTenantMenuResult {
  const [state, setState] = useState<UseTenantMenuResult>({
    products: [],
    isLoading: false,
    error: null,
  })

  useEffect(() => {
    if (!tenantId) {
      setState({ products: [], isLoading: false, error: null })
      return
    }

    // Cache hit → instant
    const cached = menuCache.get(tenantId)
    if (cached) {
      setState({ products: cached, isLoading: false, error: null })
      return
    }

    let cancelled = false
    setState({ products: [], isLoading: true, error: null })

    ;(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select(
          "*, category:categories(id, nama, icon, urutan, created_at)"
        )
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })

      if (cancelled) return

      if (error) {
        setState({
          products: [],
          isLoading: false,
          error: error.message,
        })
        return
      }

      const products = (data ?? []) as unknown as ProductWithCategory[]

      // Sort: tersedia dulu, lalu by harga ascending
      const sorted = [...products].sort((a, b) => {
        if (a.is_available !== b.is_available) {
          return a.is_available ? -1 : 1
        }
        return Number(a.harga) - Number(b.harga)
      })

      menuCache.set(tenantId, sorted)
      setState({ products: sorted, isLoading: false, error: null })
    })()

    return () => {
      cancelled = true
    }
  }, [tenantId])

  return state
}
