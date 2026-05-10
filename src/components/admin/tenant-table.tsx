"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Edit,
  MoreHorizontal,
  Plus,
  Store,
  Trash2,
  Utensils,
} from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import type { Tenant } from "@/types"

interface TenantTableProps {
  tenants: Tenant[]
}

export function TenantTable({ tenants }: TenantTableProps) {
  const router = useRouter()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function handleToggleActive(tenant: Tenant) {
    setTogglingId(tenant.id)
    const supabase = createClient()
    const { error } = await supabase
      .from("tenants")
      .update({ is_active: !tenant.is_active })
      .eq("id", tenant.id)

    if (error) {
      toast.error("Gagal update", { description: error.message })
    } else {
      toast.success(
        tenant.is_active ? "Warung di-nonaktifkan" : "Warung diaktifkan"
      )
      router.refresh()
    }
    setTogglingId(null)
  }

  async function handleDelete(tenant: Tenant) {
    const supabase = createClient()
    const { error } = await supabase
      .from("tenants")
      .delete()
      .eq("id", tenant.id)

    if (error) {
      toast.error("Gagal menghapus", { description: error.message })
      return
    }

    toast.success(`${tenant.nama} dihapus`)
    router.refresh()
  }

  if (tenants.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="Belum ada warung"
        description="Mulai input warung pertama dari survey lapangan kamu."
        action={
          <Button asChild>
            <Link href="/admin/tenants/new">
              <Plus className="size-4" />
              Tambah Warung
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12" />
          <TableHead>Nama</TableHead>
          <TableHead className="hidden md:table-cell">Alamat</TableHead>
          <TableHead className="hidden sm:table-cell text-center">Aktif</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenants.map((t) => (
          <TableRow key={t.id}>
            <TableCell>
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
                {t.foto_url ? (
                  <Image
                    src={t.foto_url}
                    alt={t.nama}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs font-semibold text-muted-foreground">
                    {t.nama.charAt(0)}
                  </div>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="font-medium">{t.nama}</div>
              <div className="line-clamp-1 text-xs text-muted-foreground md:hidden">
                {t.alamat ?? "Alamat belum diset"}
              </div>
            </TableCell>

            <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
              <span className="line-clamp-1">
                {t.alamat ?? (
                  <span className="italic">Alamat belum diset</span>
                )}
              </span>
            </TableCell>

            <TableCell className="hidden text-center sm:table-cell">
              <Switch
                checked={t.is_active}
                disabled={togglingId === t.id}
                onCheckedChange={() => handleToggleActive(t)}
                aria-label={`Toggle aktif ${t.nama}`}
              />
            </TableCell>

            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Aksi">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/tenants/${t.id}/edit`}>
                      <Edit className="size-4" />
                      Edit Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/tenants/${t.id}/products`}>
                      <Utensils className="size-4" />
                      Kelola Menu
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DeleteConfirmDialog
                    itemName={t.nama}
                    description={
                      <>
                        Anda yakin hapus <strong>{t.nama}</strong>?
                        <br />
                        <span className="text-destructive">
                          Semua menu warung ini juga akan terhapus permanen.
                        </span>
                      </>
                    }
                    onConfirm={() => handleDelete(t)}
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        Hapus
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
