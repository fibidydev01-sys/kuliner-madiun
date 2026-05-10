"use client"

import { MapMarker, MapPopup } from "@/components/ui/map"
import { TenantPopup } from "./tenant-popup"
import type { TenantWithProducts } from "@/hooks/use-tenants"

interface TenantMarkerProps {
  tenant: TenantWithProducts
  /** Emoji yang ditampilkan di dalam pin (dari kategori produk pertama tenant) */
  emoji: string
  /** Jarak dari user dalam meter — null kalau tidak pakai fitur "Cari Terdekat" */
  distanceMeters?: number | null
}

const ACCENT = "#f59e0b" // amber-500
const ACCENT_DARK = "#d97706" // amber-600

/**
 * Custom marker dengan amber pin + emoji di tengah.
 *
 * shadcn-map's MapMarker accepts `icon` as ReactNode (auto-converted ke
 * Leaflet DivIcon via renderToString internally). Size dikontrol inline
 * di PinIcon (40x48px). iconAnchor & popupAnchor di-pass terpisah.
 *
 * NOTE: `iconSize` tidak di-expose oleh MapMarker — ukuran ditentukan
 * langsung dari dimensi root element PinIcon.
 */
function PinIcon({ emoji }: { emoji: string }) {
  return (
    <div style={{ position: "relative", width: 40, height: 48 }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: 36,
          height: 36,
          marginLeft: -18,
          background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
          borderRadius: "50% 50% 50% 0",
          transform: "rotate(-45deg)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          border: "2.5px solid white",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 5,
          left: "50%",
          width: 28,
          height: 28,
          marginLeft: -14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          lineHeight: 1,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {emoji}
      </div>
    </div>
  )
}

export function TenantMarker({
  tenant,
  emoji,
  distanceMeters = null,
}: TenantMarkerProps) {
  return (
    <MapMarker
      position={[tenant.latitude, tenant.longitude]}
      icon={<PinIcon emoji={emoji} />}
      iconAnchor={[20, 48]}
      popupAnchor={[0, -44]}
    >
      <MapPopup>
        <TenantPopup tenant={tenant} distanceMeters={distanceMeters} />
      </MapPopup>
    </MapMarker>
  )
}
