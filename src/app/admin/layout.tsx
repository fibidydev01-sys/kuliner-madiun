import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopbar } from "@/components/admin/admin-topbar"

/**
 * Admin layout — bungkus semua route /admin/*.
 *
 * Auth flow:
 * 1. proxy.ts sudah blok unauthenticated/non-admin di edge → redirect /login or /
 * 2. Layout ini adalah defensive double-check (server component, RLS-aware)
 * 3. Kalau user lolos sampai sini, dijamin super_admin
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const role = (user.app_metadata as { role?: string })?.role
  if (role !== "super_admin") {
    redirect("/")
  }

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar (hidden on mobile) */}
      <AdminSidebar />

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar userEmail={user.email ?? ""} />

        <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
