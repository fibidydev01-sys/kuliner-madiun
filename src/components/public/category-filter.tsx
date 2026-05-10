"use client"

import { Filter, RotateCcw, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

interface CategoryFilterProps {
  categories: Category[]
  selectedCategoryId: string | null
  onSelectCategory: (id: string | null) => void
  onlyOpenToday: boolean
  onToggleOpenToday: (value: boolean) => void
  totalCount: number
  filteredCount: number
  onReset: () => void
  className?: string
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onlyOpenToday,
  onToggleOpenToday,
  totalCount,
  filteredCount,
  onReset,
  className,
}: CategoryFilterProps) {
  const hasFilter = selectedCategoryId !== null || onlyOpenToday

  return (
    <div className={cn("flex flex-col gap-5 p-4 sm:p-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="size-4" />
          Filter
        </h2>
        {hasFilter ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        ) : null}
      </div>

      {/* Counter */}
      <div className="rounded-md bg-muted/60 px-3 py-2.5 text-sm">
        <span className="text-lg font-bold tabular-nums text-foreground">
          {filteredCount}
        </span>
        <span className="text-muted-foreground">
          {filteredCount !== totalCount ? ` dari ${totalCount} ` : " "}
          warung
        </span>
      </div>

      <Separator />

      {/* Kategori */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Kategori
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategoryId === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(null)}
            className="h-8"
          >
            <Store className="size-3.5" />
            Semua
          </Button>
          {categories.map((cat) => {
            const isActive = selectedCategoryId === cat.id
            return (
              <Button
                key={cat.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectCategory(isActive ? null : cat.id)}
                className="h-8"
              >
                <span aria-hidden>{cat.icon}</span>
                {cat.nama}
              </Button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Menampilkan warung yang menjual kategori terpilih.
        </p>
      </div>

      <Separator />

      {/* Status hari */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Status
        </h3>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="open-today-switch"
              className="block cursor-pointer text-sm font-medium"
            >
              Buka hari ini
            </label>
            <p className="text-xs text-muted-foreground">
              Sembunyikan warung yang libur hari ini
            </p>
          </div>
          <Switch
            id="open-today-switch"
            checked={onlyOpenToday}
            onCheckedChange={onToggleOpenToday}
          />
        </div>
      </div>
    </div>
  )
}
