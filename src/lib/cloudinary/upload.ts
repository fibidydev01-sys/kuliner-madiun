import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_FOLDER,
} from "@/lib/constants"
import type { CloudinaryUploadResult } from "@/types"

/**
 * Upload file ke Cloudinary via unsigned preset (browser-safe, no API key needed).
 *
 * Prerequisite: di Cloudinary dashboard buat upload preset:
 *   Settings → Upload → Add upload preset
 *   Mode: Unsigned
 *   Folder: foodmap (atau biarkan kosong)
 *   Save preset name = NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 *
 * @returns secure_url + public_id untuk disimpan di Supabase
 */
export async function uploadToCloudinary(
  file: File
): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME belum diset di .env.local"
    )
  }
  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET belum diset di .env.local"
    )
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
  if (CLOUDINARY_FOLDER) {
    formData.append("folder", CLOUDINARY_FOLDER)
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  )

  if (!response.ok) {
    const errText = await response.text().catch(() => "Upload gagal")
    throw new Error(`Cloudinary upload failed: ${errText}`)
  }

  return response.json()
}

/**
 * (Future) Delete foto dari Cloudinary.
 *
 * Phase 3 MVP: TIDAK di-implement supaya file count tetap rapat.
 * Kalau record di-delete dari Supabase, foto-nya jadi orphan di Cloudinary.
 *
 * Solusi cleanup nanti:
 *   1. Buat API route app/api/cloudinary/delete/route.ts dengan signed request
 *      pakai CLOUDINARY_API_SECRET (server-only).
 *   2. Atau pakai Cloudinary auto-cleanup policy (setting di dashboard).
 *   3. Atau periodic cron job yang scan orphan public_id.
 *
 * Free tier 25 GB cukup untuk skala desa/kecamatan dalam waktu dekat.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[Cloudinary] deleteFromCloudinary not implemented (Phase 3 MVP). Orphan public_id: ${publicId}`
    )
  }
}
