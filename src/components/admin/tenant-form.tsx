"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { tenantSchema, type TenantValues } from "@/lib/validators/tenant"
import { normalizeWA } from "@/lib/wa"
import { DEFAULT_CENTER, DAYS_OF_WEEK } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { CloudinaryUpload } from "@/components/admin/cloudinary-upload"
import { LocationPicker } from "@/components/admin/location-picker"
import type { Tenant } from "@/types"

interface TenantFormProps {
  tenant?: Tenant | null
}

export function TenantForm({ tenant }: TenantFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!tenant

  const form = useForm<TenantValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      nama: tenant?.nama ?? "",
      deskripsi: tenant?.deskripsi ?? "",
      nomor_wa: tenant?.nomor_wa ?? "",
      latitude: tenant?.latitude ?? DEFAULT_CENTER[0],
      longitude: tenant?.longitude ?? DEFAULT_CENTER[1],
      alamat: tenant?.alamat ?? "",
      jam_buka: tenant?.jam_buka ?? "",
      hari_libur: (tenant?.hari_libur as TenantValues["hari_libur"]) ?? [],
      rating: tenant?.rating ?? null,
      total_review: tenant?.total_review ?? null,
      is_active: tenant?.is_active ?? true,
      foto_url: tenant?.foto_url ?? null,
      foto_public_id: tenant?.foto_public_id ?? null,
    },
  })

  async function onSubmit(values: TenantValues) {
    setIsLoading(true)
    const supabase = createClient()

    // Normalize WA + clean empty strings ke null
    const payload = {
      ...values,
      nomor_wa: normalizeWA(values.nomor_wa),
      deskripsi: values.deskripsi || null,
      alamat: values.alamat || null,
      jam_buka: values.jam_buka || null,
      rating: values.rating ?? null,
      total_review: values.total_review ?? null,
    }

    const { error } = isEdit && tenant
      ? await supabase.from("tenants").update(payload).eq("id", tenant.id)
      : await supabase.from("tenants").insert(payload)

    if (error) {
      toast.error("Gagal menyimpan", { description: error.message })
      setIsLoading(false)
      return
    }

    toast.success(isEdit ? "Warung diperbarui" : "Warung berhasil ditambah")
    router.push("/admin/tenants")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* === Profil Warung === */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil Warung</CardTitle>
            <CardDescription>
              Foto utama, nama, dan info kontak.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="foto_url"
              render={() => (
                <FormItem>
                  <FormLabel>Foto Warung</FormLabel>
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
                      label={form.watch("nama") || "Foto warung"}
                    />
                  </FormControl>
                  <FormDescription>
                    Foto eksterior warung yang khas. Lebih baik foto siang/sore
                    yang terang.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Warung</FormLabel>
                  <FormControl>
                    <Input placeholder="Sate Gule Bu Marni" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Sate kambing muda + gule. Spesialnya bumbu kacang yang bikin nagih."
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    1-2 kalimat yang ngegambarin keunikan warung.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomor_wa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="08123456789"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Boleh format 08xx atau +62. Auto convert ke 62xxx saat disimpan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* === Lokasi === */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lokasi</CardTitle>
            <CardDescription>
              Klik di peta atau drag marker. Posisi marker = posisi warung di peta publik.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="latitude"
              render={() => (
                <FormItem>
                  <FormLabel>Koordinat</FormLabel>
                  <FormControl>
                    <LocationPicker
                      value={{
                        latitude: form.watch("latitude"),
                        longitude: form.watch("longitude"),
                      }}
                      onChange={({ latitude, longitude }) => {
                        form.setValue("latitude", latitude, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                        form.setValue("longitude", longitude, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.latitude?.message ||
                      form.formState.errors.longitude?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat / Patokan (opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Desa Dimong (patokan: depan SD Dimong)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Boleh patokan (&#34;samping pasar&#34;, &#34;depan masjid&#34;). Geo presisi
                    dari klik peta di atas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* === Jam Operasi === */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jam Operasi</CardTitle>
            <CardDescription>
              Info kapan warung buka dan hari libur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="jam_buka"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam Buka (opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="08:00 - 22:00"
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
              name="hari_libur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hari Libur</FormLabel>
                  <FormDescription>
                    Klik untuk toggle. Kosong = buka setiap hari.
                  </FormDescription>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = field.value.includes(day)
                      return (
                        <Button
                          key={day}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            field.onChange(
                              isSelected
                                ? field.value.filter((d: string) => d !== day)
                                : [...field.value, day]
                            )
                          }}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </Button>
                      )
                    })}
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* === Status === */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4">
                  <div>
                    <FormLabel>Aktif di peta publik</FormLabel>
                    <FormDescription>
                      Kalau off, warung tidak tampil di peta tapi data tetap tersimpan.
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
          </CardContent>
        </Card>

        {/* === Actions === */}
        <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
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
              "Update Warung"
            ) : (
              "Simpan Warung"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
