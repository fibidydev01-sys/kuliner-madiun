import { z } from "zod"

/**
 * NOTE: tidak pakai `.default()` di schema karena bikin Resolver type mismatch.
 * Default value dihandle di `defaultValues` useForm.
 */
export const productSchema = z.object({
  tenant_id: z.string().uuid("Tenant ID tidak valid"),
  category_id: z.string().uuid("Kategori wajib dipilih"),

  nama: z
    .string()
    .min(1, "Nama menu wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),

  deskripsi: z
    .string()
    .max(300, "Deskripsi maksimal 300 karakter")
    .nullable()
    .optional(),

  harga: z
    .number({ error: "Harga wajib diisi" })
    .min(0, "Harga tidak boleh negatif")
    .max(99999999, "Harga terlalu besar"),

  is_available: z.boolean(),

  foto_url: z.string().url().nullable().optional(),
  foto_public_id: z.string().nullable().optional(),
})

export type ProductValues = z.infer<typeof productSchema>
