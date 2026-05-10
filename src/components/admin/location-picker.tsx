"use client"

import { MapPin } from "lucide-react"
import { useMapEvents } from "react-leaflet"
import type { LeafletMouseEvent } from "leaflet"

import {
  Map as MapContainer,
  MapMarker,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map"
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface Coords {
  latitude: number
  longitude: number
}

interface LocationPickerProps {
  value?: Coords | null
  onChange: (coords: Coords) => void
  className?: string
}

/**
 * Klik di peta → onChange({ latitude, longitude }).
 * Drag marker → onChange dengan koordinat baru.
 *
 * Pakai useMapEvents dari react-leaflet (di-include otomatis oleh shadcn-map).
 */
function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({
  value,
  onChange,
  className,
}: LocationPickerProps) {
  const center: [number, number] = value
    ? [value.latitude, value.longitude]
    : DEFAULT_CENTER

  const markerPos: [number, number] | null = value
    ? [value.latitude, value.longitude]
    : null

  return (
    <div className={cn("space-y-2", className)}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-72 w-full overflow-hidden rounded-md border sm:h-80"
      >
        <MapTileLayer />
        <MapZoomControl />
        <ClickHandler
          onClick={(lat, lng) => onChange({ latitude: lat, longitude: lng })}
        />
        {markerPos && (
          <MapMarker
            position={markerPos}
            draggable
            eventHandlers={{
              dragend: (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
                const pos = e.target.getLatLng()
                onChange({ latitude: pos.lat, longitude: pos.lng })
              },
            }}
          />
        )}
      </MapContainer>

      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="size-3" aria-hidden />
        Klik di peta untuk set lokasi · drag marker untuk geser
      </p>

      {value ? (
        <p className="font-mono text-xs text-muted-foreground">
          Lat: {value.latitude.toFixed(6)} · Lng: {value.longitude.toFixed(6)}
        </p>
      ) : (
        <p className="text-xs italic text-muted-foreground">
          Belum ada lokasi — klik peta dulu
        </p>
      )}
    </div>
  )
}