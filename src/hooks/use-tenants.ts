"use client"

import { useCallback, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tenant } from "@/types"

/**
 * Subset produk yang ikut di-fetch bareng tenant —
 * cukup untuk hitung harga range + filter kategori, tanpa beban full menu.
 */
export type TenantProductSummary = {
  id: string
  category_id: string
  harga: number
  is_available: boolean
}

export type TenantWithProducts = Tenant & {
  products: TenantProductSummary[]
}

interface UseTenantsResult {
  tenants: TenantWithProducts[]
  isRefreshing: boolean
  refetch: () => Promise<void>
}

/**
 * Public hook untuk fetch active tenants + product summary.
 *
 * @param initial - Server-side initial data (dari page.tsx).
 *                  Hindari double-fetch on mount.
 *
 * @example
 * const { tenants, refetch, isRefreshing } = useTenants(initialFromServer)
 */
export function useTenants(initial: TenantWithProducts[] = []): UseTenantsResult {
  const [tenants, setTenants] = useState<TenantWithProducts[]>(initial)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refetch = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("tenants")
        .select(
          `
          *,
          products(id, category_id, harga, is_available)
        `
        )
        .eq("is_active", true)
        .order("nama", { ascending: true })

      if (!error && data) {
        setTenants(data as unknown as TenantWithProducts[])
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  return { tenants, refetch, isRefreshing }
}
