"use client"

import { useCallback, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Category } from "@/types"

interface UseCategoriesResult {
  categories: Category[]
  isRefreshing: boolean
  refetch: () => Promise<void>
}

/**
 * Public hook untuk fetch semua categories.
 *
 * @param initial - Server-side initial data (dari page.tsx)
 */
export function useCategories(initial: Category[] = []): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>(initial)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refetch = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("urutan", { ascending: true })

      if (!error && data) {
        setCategories(data)
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  return { categories, refetch, isRefreshing }
}
