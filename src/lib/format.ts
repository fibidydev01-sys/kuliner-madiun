import { DAYS_OF_WEEK, type DayOfWeek } from "./constants"

/**
 * Format angka jadi mata uang Rupiah Indonesia.
 * @example formatRupiah(25000) → "Rp 25.000"
 */
export function formatRupiah(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(num)) return "Rp 0"
  return `Rp ${num.toLocaleString("id-ID")}`
}

/**
 * Format jam buka. Fallback kalau kosong.
 * @example formatJam("08:00 - 22:00") → "08:00 - 22:00"
 * @example formatJam(null) → "Jam tidak tercatat"
 */
export function formatJam(jam?: string | null): string {
  if (!jam || jam.trim() === "") return "Jam tidak tercatat"
  return jam
}

/**
 * Format array hari libur jadi string Indonesia.
 * @example formatHariLibur(['minggu']) → "Tutup tiap Minggu"
 * @example formatHariLibur(['sabtu', 'minggu']) → "Tutup tiap Sabtu & Minggu"
 * @example formatHariLibur([]) → "Buka setiap hari"
 */
export function formatHariLibur(hari?: string[] | null): string {
  if (!hari || hari.length === 0) return "Buka setiap hari"

  const labels = hari
    .filter((h): h is DayOfWeek =>
      DAYS_OF_WEEK.includes(h as DayOfWeek)
    )
    .map((h) => h.charAt(0).toUpperCase() + h.slice(1))

  if (labels.length === 0) return "Buka setiap hari"
  if (labels.length === 1) return `Tutup tiap ${labels[0]}`
  if (labels.length === 2) return `Tutup tiap ${labels[0]} & ${labels[1]}`
  return `Tutup tiap ${labels.slice(0, -1).join(", ")} & ${labels[labels.length - 1]}`
}

/**
 * Format jarak meter ke string user-friendly.
 * @example formatJarak(120) → "120 m"
 * @example formatJarak(1500) → "1,5 km"
 */
export function formatJarak(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return "—"
  if (meters < 1000) return `${Math.round(meters)} m`
  const km = meters / 1000
  return `${km.toFixed(1).replace(".", ",")} km`
}

/**
 * Cek apakah warung sedang tutup berdasarkan hari libur (server-time).
 */
export function isLiburHariIni(hariLibur?: string[] | null): boolean {
  if (!hariLibur || hariLibur.length === 0) return false
  const today = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  return hariLibur.includes(today)
}
