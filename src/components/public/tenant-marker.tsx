"use client"

import { MapMarker } from "@/components/ui/map"
import type { TenantWithProducts } from "@/hooks/use-tenants"

interface TenantMarkerProps {
  tenant: TenantWithProducts
  /** Trigger saat marker di-klik — parent buka Sheet/Drawer */
  onSelect: (tenant: TenantWithProducts) => void
}

/**
 * Tipis — cuma MapMarker default dengan click handler.
 *
 * Default icon shadcn-map = MapPinIcon dari lucide-react (size-6).
 * Style otomatis match shadcn theme.
 *
 * Detail muncul di Sheet/Drawer parent (lihat TenantDetailContainer).
 */
export function TenantMarker({ tenant, onSelect }: TenantMarkerProps) {
  return (
    <MapMarker
      position={[tenant.latitude, tenant.longitude]}
      eventHandlers={{
        click: () => onSelect(tenant),
      }}
    />
  )
}
