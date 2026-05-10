import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

/**
 * Supabase client untuk Client Components (browser).
 *
 * Pakai di:
 * - "use client" components
 * - hooks (useEffect, useState fetch)
 * - event handlers
 *
 * Auth state otomatis di-sync via cookies (di-handle proxy.ts).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
