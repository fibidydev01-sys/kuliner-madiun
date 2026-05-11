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
// shadcn-map: `Map` di-rename ke `MapContainer` untuk avoid shadowing native JS `Map`
import {
  Map as MapContainer,
  MapTileLayer,
  MapZoomControl,
  MapCircle,
  MapMarkerClusterGroup,
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
import { TenantDetailContainer } from "./tenant-detail-container"
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

/** Radius visual area Dimong (meter) — bukan filter logika */
const DIMONG_AREA_RADIUS_M = 1000

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

  // Selected tenant untuk Sheet/Drawer detail
  const [selectedTenant, setSelectedTenant] =
    useState<TenantWithProducts | null>(null)

  // Filter pipeline
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

    if (nearby.orderedIds !== null) {
      const nearbySet = new Set(nearby.orderedIds)
      result = result.filter((t) => nearbySet.has(t.id))
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

  function handleResetFilter() {
    setSelectedCategoryId(null)
    setOnlyOpenToday(false)
    nearby.reset()
  }

  const activeFilterCount =
    (selectedCategoryId ? 1 : 0) +
    (onlyOpenToday ? 1 : 0) +
    (nearby.orderedIds !== null ? 1 : 0)

  const mapCenter: [number, number] = nearby.userLocation
    ? [nearby.userLocation.latitude, nearby.userLocation.longitude]
    : DEFAULT_CENTER

  const filterContent = (
    <CategoryFilter
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={(id) => {
        setSelectedCategoryId(id)
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

  // Distance untuk tenant yang sedang di-select
  const selectedDistance = selectedTenant
    ? nearby.distances.get(selectedTenant.id) ?? null
    : null

  return (
    <div className="flex h-svh w-full overflow-hidden">
      {/* === Desktop sidebar (filter) === */}
      <aside className="hidden w-80 shrink-0 flex-col border-r bg-card lg:flex">
        <div className="border-b p-4 sm:p-5">
          <h1 className="text-lg font-bold tracking-tight">{BRAND_NAME}</h1>
          <p className="mt-0.5 text-xs italic text-muted-foreground">
            {TAGLINE}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3" aria-hidden />
            {DEFAULT_CITY_NAME}
          </div>
          <div className="mt-3">
            <NearbyButton nearby={nearby} className="w-full" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{filterContent}</div>

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
        {/* Mobile brand chip + nearby button */}
        <div className="pointer-events-none absolute left-3 top-3 z-[800] flex flex-col gap-2 lg:hidden">
          <div className="pointer-events-auto rounded-full border bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3 text-amber-600" aria-hidden />
              <span className="text-xs font-bold leading-none">
                {BRAND_NAME}
              </span>
            </div>
          </div>
          <div className="pointer-events-auto">
            <NearbyButton nearby={nearby} />
          </div>
        </div>

        {/* Empty state: filter no match */}
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

        {/* Empty state: DB kosong */}
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

          {/* Zoom control — pojok kanan atas (Tailwind positioning shadcn-map) */}
          <MapZoomControl position="top-2 right-2" />

          {/* Area Dimong visual — lingkaran amber, visual only */}
          <MapCircle
            center={DEFAULT_CENTER}
            radius={DIMONG_AREA_RADIUS_M}
            pathOptions={{
              color: "#d97706", // amber-600
              weight: 2,
              opacity: 0.7,
              fillColor: "#f59e0b", // amber-500
              fillOpacity: 0.08,
              dashArray: "6 6",
              interactive: false,
            }}
          />

          {/* Markers dalam cluster group — auto-cluster kalau dekat.
              Default style ditangani globals.css (override marker-cluster-*) */}
          <MapMarkerClusterGroup
            showCoverageOnHover={false}
            spiderfyOnMaxZoom
            maxClusterRadius={50}
            disableClusteringAtZoom={18}
          >
            {filteredTenants.map((t) => (
              <TenantMarker
                key={t.id}
                tenant={t}
                onSelect={setSelectedTenant}
              />
            ))}
          </MapMarkerClusterGroup>
        </MapContainer>

        {/* Mobile filter FAB */}
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

      {/* === Tenant detail Sheet/Drawer (2-state: preview & menu) === */}
      <TenantDetailContainer
        tenant={selectedTenant}
        distanceMeters={selectedDistance}
        onClose={() => setSelectedTenant(null)}
      />
    </div>
  )
}
