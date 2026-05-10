import { z } from "zod"

/**
 * NOTE: tidak pakai `.default()` di schema karena bikin input/output type mismatch
 * (input optional, output required) yang nge-break Resolver type di react-hook-form.
 * Default value dihandle di `defaultValues` useForm.
 */
export const categorySchema = z.object({
  nama: z
    .string()
    .min(1, "Nama kategori wajib diisi")
    .max(50, "Nama maksimal 50 karakter"),
  icon: z
    .string()
    .min(1, "Icon wajib diisi (emoji)")
    .max(10, "Icon maksimal 10 karakter"),
  urutan: z.number().int().min(0),
})

export type CategoryValues = z.infer<typeof categorySchema>
