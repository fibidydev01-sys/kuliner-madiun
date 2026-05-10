import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TenantForm } from "@/components/admin/tenant-form"

export const metadata = { title: "Tambah Warung" }

export default function NewTenantPage() {
  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/admin/tenants">
            <ArrowLeft className="size-4" />
            Kembali ke daftar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Tambah Warung</h1>
        <p className="text-sm text-muted-foreground">
          Input data warung baru. Wajib: nama, WA, dan koordinat.
        </p>
      </div>

      <TenantForm />
    </div>
  )
}
