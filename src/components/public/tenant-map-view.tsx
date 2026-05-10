"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Filter, MapPin } from "lucide-react"

import {
  BRAND_NAME,
  DEFAULT_CENTER,
  DEFAULT_CITY_NAME,
  DEFAULT_ZOOM,
  TAGLINE,
} from "@/lib/constants"
// IMPORTANT: rename Map → MapContainer untuk avoid shadowing native JS `Map`
import {
  Map as MapContainer,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  useTenants,
  type TenantWithProducts,
} from "@/hooks/use-tenants"
import { useCategories } from "@/hooks/use-categories"
import { useNearbyTenants } from "@/hooks/use-nearby-tenants"
import { CategoryFilter } from "./category-filter"
import { NearbyButton } from "./nearby-button"
import { TenantMarker } from "./tenant-marker"
import type { Category } from "@/types"

interface TenantMapViewProps {
  initialTenants: TenantWithProducts[]
  initialCategories: Category[]
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

export function TenantMapView({
  initialTenants,
  initialCategories,
}: TenantMapViewProps) {
  const { tenants } = useTenants(initialTenants)
  const { categories } = useCategories(initialCategories)
  const nearby = useNearbyTenants()

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )
  const [onlyOpenToday, setOnlyOpenToday] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Filter pipeline:
  // 1. Apply category filter
  // 2. Apply "open today" filter
  // 3. If nearby active: keep only tenants in result + sort by distance
  const filteredTenants = useMemo(() => {
    let result = tenants

    if (selectedCategoryId) {
      result = result.filter((t) =>
        t.products?.some((p) => p.category_id === selectedCategoryId)
      )
    }

    if (onlyOpenToday) {
      const today = HARI_LIBUR_DAYS[new Date().getDay()]
      result = result.filter((t) => {
        const hariLibur = (t.hari_libur ?? []) as string[]
        return !hariLibur.includes(today)
      })
    }

    // Nearby active → restrict to nearby IDs + sort by distance order
    if (nearby.orderedIds !== null) {
      const nearbySet = new Set(nearby.orderedIds)
      result = result.filter((t) => nearbySet.has(t.id))
      // Build position map (use globalThis.Map to disambiguate from shadcn import)
      const orderMap: globalThis.Map<string, number> = new globalThis.Map(
        nearby.orderedIds.map((id, idx) => [id, idx] as [string, number])
      )
      result = [...result].sort(
        (a, b) =>
          (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999)
      )
    }

    return result
  }, [tenants, selectedCategoryId, onlyOpenToday, nearby.orderedIds])

  // Map: tenant id → emoji (dari kategori produk pertama)
  const tenantEmojis = useMemo(() => {
    const m: globalThis.Map<string, string> = new globalThis.Map()
    for (const t of tenants) {
      const primaryCatId = t.products?.[0]?.category_id
      const cat = categories.find((c) => c.id === primaryCatId)
      m.set(t.id, cat?.icon ?? "🍴")
    }
    return m
  }, [tenants, categories])

  function handleResetFilter() {
    setSelectedCategoryId(null)
    setOnlyOpenToday(false)
    nearby.reset()
  }

  const activeFilterCount =
    (selectedCategoryId ? 1 : 0) +
    (onlyOpenToday ? 1 : 0) +
    (nearby.orderedIds !== null ? 1 : 0)

  // Center peta ke lokasi user kalau nearby aktif (better UX)
  const mapCenter: [number, number] = nearby.userLocation
    ? [nearby.userLocation.latitude, nearby.userLocation.longitude]
    : DEFAULT_CENTER

  const filterContent = (
    <CategoryFilter
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={(id) => {
        setSelectedCategoryId(id)
        // Auto close sheet on mobile after selection
        setFilterSheetOpen(false)
      }}
      onlyOpenToday={onlyOpenToday}
      onToggleOpenToday={setOnlyOpenToday}
      totalCount={tenants.length}
      filteredCount={filteredTenants.length}
      onReset={() => {
        handleResetFilter()
        setFilterSheetOpen(false)
      }}
    />
  )

  return (
    <div className="flex h-svh w-full overflow-hidden">
      {/* === Desktop sidebar === */}
      <aside className="hidden w-80 shrink-0 flex-col border-r bg-card lg:flex">
        {/* Brand */}
        <div className="border-b p-4 sm:p-5">
          <h1 className="text-lg font-bold tracking-tight">{BRAND_NAME}</h1>
          <p className="mt-0.5 text-xs italic text-muted-foreground">
            {TAGLINE}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3" aria-hidden />
            {DEFAULT_CITY_NAME}
          </div>

          {/* Nearby button — under brand */}
          <div className="mt-3">
            <NearbyButton nearby={nearby} className="w-full" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{filterContent}</div>

        {/* Footer */}
        <div className="border-t p-3 text-center">
          <Link
            href="/login"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin login
          </Link>
        </div>
      </aside>

      {/* === Map area === */}
      <div className="relative flex-1">
        {/* Mobile brand chip + nearby button (top-left) */}
        <div className="pointer-events-none absolute left-3 top-3 z-[800] flex flex-col gap-2 lg:hidden">
          <div className="pointer-events-auto rounded-full border bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3 text-amber-600" aria-hidden />
              <span className="text-xs font-bold leading-none">
                {BRAND_NAME}
              </span>
            </div>
          </div>

          {/* Mobile nearby button — separate row, more tappable */}
          <div className="pointer-events-auto">
            <NearbyButton nearby={nearby} />
          </div>
        </div>

        {/* Empty state overlay — filter no match but DB has tenants */}
        {filteredTenants.length === 0 && tenants.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-3 top-32 z-[800] mx-auto max-w-md lg:left-6 lg:right-6 lg:top-6">
            <div className="pointer-events-auto rounded-lg border bg-background/95 p-4 text-center shadow-lg backdrop-blur">
              <p className="text-sm font-semibold">
                {nearby.orderedIds !== null
                  ? "Tidak ada warung dalam radius 5 km"
                  : "Tidak ada warung sesuai filter"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {nearby.orderedIds !== null
                  ? "Coba reset filter atau geser peta ke area lain"
                  : "Coba ubah kategori atau matikan filter \"buka hari ini\""}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilter}
                className="mt-3"
              >
                Reset filter
              </Button>
            </div>
          </div>
        ) : null}

        {/* Empty state — DB kosong sama sekali */}
        {tenants.length === 0 ? (
          <div className="pointer-events-none absolute inset-x-3 top-16 z-[800] mx-auto max-w-md lg:left-6 lg:right-6 lg:top-6">
            <div className="pointer-events-auto rounded-lg border bg-background/95 p-4 text-center shadow-lg backdrop-blur">
              <p className="text-sm font-semibold">
                Belum ada warung di {DEFAULT_CITY_NAME}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Direktori sedang dibangun. Cek lagi nanti.
              </p>
            </div>
          </div>
        ) : null}

        {/* === Map === */}
        <MapContainer
          center={mapCenter}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
        >
          <MapTileLayer />
          <MapZoomControl />
          {filteredTenants.map((t) => (
            <TenantMarker
              key={t.id}
              tenant={t}
              emoji={tenantEmojis.get(t.id) ?? "🍴"}
              distanceMeters={nearby.distances.get(t.id) ?? null}
            />
          ))}
        </MapContainer>

        {/* === Mobile filter FAB (bottom-right) === */}
        <div className="absolute bottom-6 right-4 z-[800] lg:hidden">
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full pl-4 pr-5 shadow-lg">
                <Filter className="size-4" />
                Filter
                {activeFilterCount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 px-1.5 text-[10px] tabular-nums"
                  >
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85svh] p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle>Filter Warung</SheetTitle>
              </SheetHeader>
              <div
                className="overflow-y-auto"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              >
                {filterContent}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}