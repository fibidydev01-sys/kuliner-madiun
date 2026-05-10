"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { productSchema, type ProductValues } from "@/lib/validators/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CloudinaryUpload } from "@/components/admin/cloudinary-upload"
import type { Category, ProductWithCategory } from "@/types"

interface ProductFormDialogProps {
  tenantId: string
  product?: ProductWithCategory | null
  categories: Category[]
  trigger: React.ReactNode
}

export function ProductFormDialog({
  tenantId,
  product,
  categories,
  trigger,
}: ProductFormDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <ProductFormContent
          tenantId={tenantId}
          product={product}
          categories={categories}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface ProductFormContentProps {
  tenantId: string
  product?: ProductWithCategory | null
  categories: Category[]
  onSuccess: () => void
  onCancel: () => void
}

function ProductFormContent({
  tenantId,
  product,
  categories,
  onSuccess,
  onCancel,
}: ProductFormContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!product

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      tenant_id: tenantId,
      category_id: product?.category_id ?? categories[0]?.id ?? "",
      nama: product?.nama ?? "",
      deskripsi: product?.deskripsi ?? "",
      harga: product?.harga ?? 0,
      is_available: product?.is_available ?? true,
      foto_url: product?.foto_url ?? null,
      foto_public_id: product?.foto_public_id ?? null,
    },
  })

  async function onSubmit(values: ProductValues) {
    setIsLoading(true)
    const supabase = createClient()

    const payload = {
      ...values,
      deskripsi: values.deskripsi || null,
    }

    const { error } = isEdit
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload)

    if (error) {
      toast.error("Gagal menyimpan", { description: error.message })
      setIsLoading(false)
      return
    }

    toast.success(isEdit ? "Menu diperbarui" : "Menu ditambah")
    router.refresh()
    onSuccess()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Menu" : "Tambah Menu"}</DialogTitle>
        <DialogDescription>
          Foto, kategori, harga membantu pelanggan memutuskan cepat.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="foto_url"
            render={() => (
              <FormItem>
                <FormLabel>Foto Menu (opsional)</FormLabel>
                <FormControl>
                  <CloudinaryUpload
                    value={{
                      url: form.watch("foto_url") ?? null,
                      publicId: form.watch("foto_public_id") ?? null,
                    }}
                    onChange={(result) => {
                      form.setValue("foto_url", result?.url ?? null, {
                        shouldDirty: true,
                      })
                      form.setValue(
                        "foto_public_id",
                        result?.publicId ?? null,
                        { shouldDirty: true }
                      )
                    }}
                    label={form.watch("nama") || "Foto menu"}
                    aspectClass="aspect-square"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Menu</FormLabel>
                <FormControl>
                  <Input placeholder="Sate Kambing 10 tusuk" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.icon} {c.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="harga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={500}
                      placeholder="25000"
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
          </div>

          <FormField
            control={form.control}
            name="deskripsi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi (opsional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Lemak ideal, bumbu kacang melimpah"
                    rows={2}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_available"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <FormLabel className="text-sm">Tersedia</FormLabel>
                  <FormDescription className="text-xs">
                    Off → tombol WA disabled di publik (label &#34;Habis&#34;).
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
              ) : isEdit ? (
                "Update"
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
