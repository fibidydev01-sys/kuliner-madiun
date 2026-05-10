"use client"

import { Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

interface CategoryTabsProps {
  categories: Category[]
  selectedCategoryId: string | null
  onSelect: (id: string | null) => void
  /** Map kategori_id → jumlah produk di tenant ini */
  counts: Record<string, number>
  totalCount: number
}

/**
 * Horizontal scrollable category tabs untuk detail page menu.
 * Mobile: scrollable kalau banyak kategori, desktop: inline.
 * Setiap tab tampilkan jumlah produk per kategori.
 */
export function CategoryTabs({
  categories,
  selectedCategoryId,
  onSelect,
  counts,
  totalCount,
}: CategoryTabsProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
      <div className="flex gap-2 pb-1">
        {/* Semua */}
        <Button
          variant={selectedCategoryId === null ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(null)}
          className="shrink-0"
        >
          <Store className="size-3.5" aria-hidden />
          Semua
          <span
            className={cn(
              "ml-1 text-xs tabular-nums",
              selectedCategoryId === null
                ? "opacity-80"
                : "text-muted-foreground"
            )}
          >
            {totalCount}
          </span>
        </Button>

        {/* Per kategori */}
        {categories.map((cat) => {
          const isActive = selectedCategoryId === cat.id
          const count = counts[cat.id] ?? 0
          return (
            <Button
              key={cat.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onSelect(isActive ? null : cat.id)}
              className="shrink-0"
            >
              <span aria-hidden>{cat.icon}</span>
              {cat.nama}
              <span
                className={cn(
                  "ml-1 text-xs tabular-nums",
                  isActive ? "opacity-80" : "text-muted-foreground"
                )}
              >
                {count}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
