import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { TenantForm } from "@/components/admin/tenant-form"

export const metadata = { title: "Edit Warung" }

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single()

  if (!tenant) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/admin/tenants">
            <ArrowLeft className="size-4" />
            Kembali ke daftar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Warung</h1>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {tenant.nama}
        </p>
      </div>

      <TenantForm tenant={tenant} />
    </div>
  )
}
