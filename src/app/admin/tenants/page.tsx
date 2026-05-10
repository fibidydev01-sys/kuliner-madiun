import Link from "next/link"
import { Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { TenantTable } from "@/components/admin/tenant-table"

export const metadata = { title: "Warung" }

export default async function TenantsListPage() {
  const supabase = await createClient()
  const { data: tenants } = await supabase
    .from("tenants")
    .select("*")
    .order("updated_at", { ascending: false })

  const items = tenants ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warung</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} warung di direktori
            {items.length > 0 ? (
              <>
                {" · "}
                {items.filter((t) => t.is_active).length} aktif
              </>
            ) : null}
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/tenants/new">
            <Plus className="size-4" />
            Tambah Warung
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <TenantTable tenants={items} />
      </div>
    </div>
  )
}
