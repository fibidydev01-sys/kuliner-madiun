/**
 * Normalisasi nomor WA Indonesia ke format internasional 62xxx.
 *
 * @example normalizeWA("08123456789")     → "628123456789"
 * @example normalizeWA("+628123456789")   → "628123456789"
 * @example normalizeWA("0812-3456-789")   → "628123456789"
 * @example normalizeWA("8123456789")      → "628123456789"
 * @example normalizeWA("628123456789")    → "628123456789"
 */
export function normalizeWA(input: string): string {
  if (!input) return ""

  // buang semua non-digit
  let num = input.replace(/\D/g, "")

  // mulai dengan 0 → ganti jadi 62
  if (num.startsWith("0")) num = "62" + num.slice(1)

  // jaga-jaga: 620... → 62...
  if (num.startsWith("620")) num = "62" + num.slice(3)

  // belum diawali 62 → tambahkan
  if (!num.startsWith("62")) num = "62" + num

  return num
}

/**
 * Validasi format nomor WA Indonesia.
 * Format akhir harus: 62 + 8-14 digit (628xxxxxxx).
 */
export function isValidWA(input: string): boolean {
  const normalized = normalizeWA(input)
  return /^62[0-9]{8,14}$/.test(normalized)
}

// ---------- generateWALink overloads ----------

/**
 * Generate wa.me deep link dengan custom pesan (dipakai oleh WaCtaButton).
 *
 * @example
 * generateWALink("6285123450005", "Halo, saya mau pesan Sate Kambing")
 * → "https://wa.me/6285123450005?text=Halo%2C%20saya%20mau%20pesan%20..."
 */
export function generateWALink(nomorWA: string, message: string): string

/**
 * Generate wa.me deep link dengan format pesan terstruktur (legacy / detail page).
 *
 * @example
 * generateWALink("6285123450005", "Sate Gule Bu Marni", "Sate Kambing 10 tusuk", 35000)
 * → "https://wa.me/6285123450005?text=Halo%2C%20saya%20mau%20pesan%20*Sate%20Kambing%2010%20tusuk*..."
 */
export function generateWALink(
  nomorWA: string,
  warungNama: string,
  menuNama: string,
  harga: number
): string

// Implementation
export function generateWALink(
  nomorWA: string,
  messageOrWarungNama: string,
  menuNama?: string,
  harga?: number
): string {
  const normalized = normalizeWA(nomorWA)

  // 2-arg signature: caller provided custom message
  if (menuNama === undefined || harga === undefined) {
    const encoded = encodeURIComponent(messageOrWarungNama)
    return `https://wa.me/${normalized}?text=${encoded}`
  }

  // 4-arg signature: legacy structured format
  const hargaFmt = `Rp ${harga.toLocaleString("id-ID")}`
  const pesan = `Halo, saya mau pesan *${menuNama}* (${hargaFmt}) dari ${messageOrWarungNama}. Apakah masih tersedia?`
  const encoded = encodeURIComponent(pesan)
  return `https://wa.me/${normalized}?text=${encoded}`
}

/**
 * Generate WA link generic (tanpa menu spesifik) — tanya menu langsung ke warung.
 */
export function generateWALinkGeneric(
  nomorWA: string,
  warungNama: string
): string {
  const normalized = normalizeWA(nomorWA)
  const pesan = `Halo, saya mau tanya tentang menu di ${warungNama}.`
  const encoded = encodeURIComponent(pesan)
  return `https://wa.me/${normalized}?text=${encoded}`
}