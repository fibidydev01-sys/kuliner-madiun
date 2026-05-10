import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

/**
 * Supabase client untuk Server Components, Server Actions, Route Handlers.
 *
 * Pakai di:
 * - async page.tsx (Server Components)
 * - layout.tsx
 * - "use server" actions
 * - app/api/.../route.ts
 *
 * RLS aktif — query otomatis sesuai role user (anon / authenticated / super_admin).
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll dipanggil dari Server Component (read-only) — abaikan.
            // proxy.ts handle session refresh-nya.
          }
        },
      },
    }
  )
}
