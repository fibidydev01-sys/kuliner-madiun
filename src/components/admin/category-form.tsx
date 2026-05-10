"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { categorySchema, type CategoryValues } from "@/lib/validators/category"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog"
import type { Category } from "@/types"

// ---------- Form Dialog (create + edit) ----------

interface CategoryFormDialogProps {
  category?: Category | null
  trigger: React.ReactNode
}

export function CategoryFormDialog({
  category,
  trigger,
}: CategoryFormDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <CategoryFormContent
          category={category}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface CategoryFormContentProps {
  category?: Category | null
  onSuccess: () => void
  onCancel: () => void
}

function CategoryFormContent({
  category,
  onSuccess,
  onCancel,
}: CategoryFormContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!category

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nama: category?.nama ?? "",
      icon: category?.icon ?? "",
      urutan: category?.urutan ?? 0,
    },
  })

  async function onSubmit(values: CategoryValues) {
    setIsLoading(true)
    const supabase = createClient()

    const { error } = isEdit
      ? await supabase.from("categories").update(values).eq("id", category.id)
      : await supabase.from("categories").insert(values)

    if (error) {
      toast.error("Gagal menyimpan", { description: error.message })
      setIsLoading(false)
      return
    }

    toast.success(isEdit ? "Kategori diperbarui" : "Kategori ditambah")
    router.refresh()
    onSuccess()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
        <DialogDescription>
          Kategori dipakai untuk grouping menu (Makanan / Minuman / dll).
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Makanan" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon (emoji)</FormLabel>
                <FormControl>
                  <Input placeholder="🍽️" maxLength={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="urutan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urutan tampilan</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value ?? 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const v = e.target.valueAsNumber
                      field.onChange(Number.isNaN(v) ? 0 : v)
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}

// ---------- Delete Button (with confirm dialog) ----------

export function CategoryDeleteButton({ category }: { category: Category }) {
  const router = useRouter()

  async function handleDelete() {
    const supabase = createClient()
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id)

    if (error) {
      toast.error("Gagal menghapus", { description: error.message })
      return
    }

    toast.success(`Kategori ${category.nama} dihapus`)
    router.refresh()
  }

  return (
    <DeleteConfirmDialog
      itemName={category.nama}
      description={
        <>
          Anda yakin hapus <strong>{category.nama}</strong>?
          <br />
          Pastikan tidak ada menu yang masih pakai kategori ini, atau delete akan gagal.
        </>
      }
      onConfirm={handleDelete}
      trigger={
        <Button variant="ghost" size="icon" aria-label={`Hapus ${category.nama}`}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      }
    />
  )
}
