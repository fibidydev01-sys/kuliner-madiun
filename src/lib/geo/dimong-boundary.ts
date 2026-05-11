/**
 * Boundary polygon untuk Desa Dimong, Kec. Madiun, Kab. Madiun.
 *
 * ⚠️ APPROXIMATE — digambar manual berdasarkan:
 * - Data official: luas ~214,945 hektar (~2.15 km²) per dimong.site
 * - Batas: U=Kebonagung/Sumberejo, T=Ngadirejo, S=Nglambangan/Sobrah/Nglanduk, B=Pilangbango
 * - Center: Lapangan Dimong (-7.5908, 111.5863)
 *
 * Untuk batas presisi level kadaster, ganti `coordinates` di bawah dengan
 * GeoJSON resmi dari BPN / Kelurahan Dimong. Konsumen file ini tidak perlu diubah.
 *
 * Format: GeoJSON RFC 7946 — koordinat dalam urutan [longitude, latitude]
 * (kebalikan dari Leaflet yang pakai [lat, lng]).
 */

import type { Feature, Polygon } from "geojson"

export const DIMONG_BOUNDARY: Feature<Polygon> = {
  type: "Feature",
  properties: {
    name: "Desa Dimong",
    kecamatan: "Madiun",
    kabupaten: "Madiun",
    provinsi: "Jawa Timur",
    luas_hektar: 214.945,
    sumber: "Approximate boundary — refine dengan data BPN/Kelurahan",
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        // Outline kasar mengelilingi Lapangan Dimong sebagai centroid.
        // ~1.4 km bentang barat-timur × ~1.5 km bentang utara-selatan
        // Urutan: barat-utara → utara → timur → selatan → barat → tutup polygon.

        // Sisi utara (berbatasan Kebonagung/Sumberejo)
        [111.5795, -7.5840],
        [111.5830, -7.5825],
        [111.5870, -7.5820],
        [111.5910, -7.5828],
        [111.5945, -7.5840],

        // Sisi timur (berbatasan Ngadirejo)
        [111.5965, -7.5870],
        [111.5970, -7.5905],
        [111.5960, -7.5940],
        [111.5945, -7.5970],

        // Sisi selatan (berbatasan Nglambangan/Sobrah/Nglanduk)
        [111.5905, -7.5985],
        [111.5870, -7.5990],
        [111.5830, -7.5985],
        [111.5800, -7.5970],

        // Sisi barat (berbatasan Pilangbango/Kodia Madiun)
        [111.5780, -7.5945],
        [111.5775, -7.5910],
        [111.5780, -7.5875],

        // Tutup polygon ke titik awal
        [111.5795, -7.5840],
      ],
    ],
  },
}

/**
 * Get coordinates dalam format Leaflet [lat, lng].
 * GeoJSON pakai [lng, lat], Leaflet pakai [lat, lng] — flip otomatis.
 */
export function getDimongBoundaryLatLng(): [number, number][] {
  const ring = DIMONG_BOUNDARY.geometry.coordinates[0]
  return ring.map(([lng, lat]) => [lat, lng])
}

/**
 * Style default untuk render polygon di Leaflet.
 * Amber tipis, dashed, fill transparan — visual context, bukan attention grabber.
 */
export const DIMONG_BOUNDARY_STYLE = {
  color: "#d97706", // amber-600
  weight: 2,
  opacity: 0.7,
  fillColor: "#f59e0b", // amber-500
  fillOpacity: 0.08,
  dashArray: "6 6",
  interactive: false, // visual-only, gak intercept click
} as const
