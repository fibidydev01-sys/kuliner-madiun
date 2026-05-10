import { z } from "zod"
import { isValidWA } from "@/lib/wa"

const HARI_LIBUR_VALUES = [
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
  "minggu",
] as const

/**
 * NOTE: pakai z.number() langsung (bukan z.coerce.number()).
 * Zod v4 coerce types input as `unknown`, yang bikin Resolver type tidak match
 * dengan FormValues di react-hook-form.
 *
 * String-to-number conversion handled di JSX dengan onChange handler
 * yang baca `e.target.valueAsNumber`.
 *
 * NOTE 2: tidak pakai `.default()` karena bikin input/output type mismatch
 * yang nge-break Resolver. Default value dihandle di `defaultValues` useForm.
 */
export const tenantSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama warung wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),

  deskripsi: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .nullable()
    .optional(),

  nomor_wa: z
    .string()
    .min(1, "Nomor WA wajib diisi")
    .refine(isValidWA, "Nomor WA tidak valid (contoh: 08123456789)"),

  latitude: z
    .number({ error: "Latitude wajib diisi" })
    .min(-90, "Latitude tidak valid")
    .max(90, "Latitude tidak valid"),

  longitude: z
    .number({ error: "Longitude wajib diisi" })
    .min(-180, "Longitude tidak valid")
    .max(180, "Longitude tidak valid"),

  alamat: z
    .string()
    .max(200, "Alamat maksimal 200 karakter")
    .nullable()
    .optional(),

  jam_buka: z
    .string()
    .max(50, "Jam buka maksimal 50 karakter")
    .nullable()
    .optional(),

  hari_libur: z.array(z.enum(HARI_LIBUR_VALUES)),

  rating: z
    .number()
    .min(0)
    .max(5, "Rating maksimal 5")
    .nullable()
    .optional(),

  total_review: z.number().int().min(0).nullable().optional(),

  is_active: z.boolean(),

  foto_url: z.string().url().nullable().optional(),
  foto_public_id: z.string().nullable().optional(),
})

export type TenantValues = z.infer<typeof tenantSchema>
