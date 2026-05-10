"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Edit, MoreHorizontal, Trash2, Utensils } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { formatRupiah } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
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
import { ProductFormDialog } from "@/components/admin/product-form"
import { EmptyState } from "@/components/shared/empty-state"
import type { Category, ProductWithCategory } from "@/types"

interface ProductTableProps {
  products: ProductWithCategory[]
  tenantId: string
  categories: Category[]
}

export function ProductTable({
  products,
  tenantId,
  categories,
}: ProductTableProps) {
  const router = useRouter()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function handleToggleAvailable(product: ProductWithCategory) {
    setTogglingId(product.id)
    const supabase = createClient()
    const { error } = await supabase
      .from("products")
      .update({ is_available: !product.is_available })
      .eq("id", product.id)

    if (error) {
      toast.error("Gagal update", { description: error.message })
    } else {
      toast.success(
        product.is_available ? "Menu di-tandai habis" : "Menu di-tandai tersedia"
      )
      router.refresh()
    }
    setTogglingId(null)
  }

  async function handleDelete(product: ProductWithCategory) {
    const supabase = createClient()
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)

    if (error) {
      toast.error("Gagal menghapus", { description: error.message })
      return
    }

    toast.success(`${product.nama} dihapus`)
    router.refresh()
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Utensils}
        title="Belum ada menu"
        description="Tambah menu pertama untuk warung ini."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12" />
          <TableHead>Nama</TableHead>
          <TableHead className="hidden sm:table-cell">Kategori</TableHead>
          <TableHead className="text-right">Harga</TableHead>
          <TableHead className="hidden text-center sm:table-cell">
            Tersedia
          </TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow
            key={p.id}
            className={!p.is_available ? "opacity-60" : ""}
          >
            <TableCell>
              <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                {p.foto_url ? (
                  <Image
                    src={p.foto_url}
                    alt={p.nama}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs font-semibold text-muted-foreground">
                    {p.nama.charAt(0)}
                  </div>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="font-medium">{p.nama}</div>
              {p.deskripsi ? (
                <div className="line-clamp-1 text-xs text-muted-foreground">
                  {p.deskripsi}
                </div>
              ) : null}
              <div className="mt-1 sm:hidden">
                <Badge variant="secondary" className="text-xs">
                  {p.category.icon} {p.category.nama}
                </Badge>
              </div>
            </TableCell>

            <TableCell className="hidden sm:table-cell">
              <Badge variant="secondary">
                {p.category.icon} {p.category.nama}
              </Badge>
            </TableCell>

            <TableCell className="text-right font-medium tabular-nums">
              {formatRupiah(p.harga)}
            </TableCell>

            <TableCell className="hidden text-center sm:table-cell">
              <Switch
                checked={p.is_available}
                disabled={togglingId === p.id}
                onCheckedChange={() => handleToggleAvailable(p)}
                aria-label={`Toggle tersedia ${p.nama}`}
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
                  <ProductFormDialog
                    tenantId={tenantId}
                    product={p}
                    categories={categories}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="size-4" />
                        Edit
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuSeparator />
                  <DeleteConfirmDialog
                    itemName={p.nama}
                    onConfirm={() => handleDelete(p)}
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
