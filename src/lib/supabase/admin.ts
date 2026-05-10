import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

/**
 * Supabase admin client dengan service_role key.
 *
 * ⚠️ SERVER-ONLY — JANGAN expose ke browser.
 * Bypass RLS — punya akses penuh ke semua data.
 *
 * Pakai HANYA untuk:
 * - Operasi maintenance (set custom claim user)
 * - Webhook handler (Cloudinary callback, Supabase trigger)
 * - Cron job / scheduled function
 * - Hapus foto Cloudinary saat record di-delete
 *
 * UNTUK CRUD ADMIN BIASA → pakai createClient dari "@/lib/supabase/server"
 * supaya RLS tetap aktif & validasi role super_admin terjaga.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    )
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}
