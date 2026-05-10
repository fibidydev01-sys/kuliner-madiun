import Link from "next/link"
import Image from "next/image"
import {
  Plus,
  Store,
  Utensils,
  Tag as TagIcon,
  TrendingUp,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { BRAND_NAME, DEFAULT_CITY_NAME } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Dashboard",
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Parallel fetch — 5 query bersama-sama
  const [
    activeRes,
    totalRes,
    productsAvailableRes,
    productsTotalRes,
    categoriesRes,
    recentRes,
  ] = await Promise.all([
    supabase
      .from("tenants")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("tenants").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_available", true),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase
      .from("tenants")
      .select("id, nama, foto_url, is_active, alamat, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
  ])

  const tenantsActive = activeRes.count ?? 0
  const tenantsTotal = totalRes.count ?? 0
  const productsAvailable = productsAvailableRes.count ?? 0
  const productsTotal = productsTotalRes.count ?? 0
  const categoriesTotal = categoriesRes.count ?? 0
  const recentTenants = recentRes.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {BRAND_NAME} · {DEFAULT_CITY_NAME}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/categories">
              <TagIcon className="size-4" />
              Kategori
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/tenants/new">
              <Plus className="size-4" />
              Tambah Warung
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Store}
          label="Warung Aktif"
          value={tenantsActive}
          subtitle={
            tenantsTotal > tenantsActive
              ? `dari ${tenantsTotal} total (${tenantsTotal - tenantsActive} non-aktif)`
              : tenantsTotal === tenantsActive && tenantsTotal > 0
                ? "semua aktif"
                : "belum ada warung"
          }
          accent="amber"
        />
        <StatCard
          icon={Utensils}
          label="Menu Tersedia"
          value={productsAvailable}
          subtitle={
            productsTotal > productsAvailable
              ? `dari ${productsTotal} total`
              : productsTotal === 0
                ? "belum ada menu"
                : "semua tersedia"
          }
          accent="emerald"
        />
        <StatCard
          icon={TagIcon}
          label="Kategori"
          value={categoriesTotal}
          subtitle="Makanan & Minuman"
          accent="sky"
        />
        <StatCard
          icon={TrendingUp}
          label="Status"
          value={tenantsActive > 0 ? "Live" : "—"}
          subtitle={
            tenantsActive > 0
              ? "peta publik aktif"
              : "tambah warung pertama dulu"
          }
          accent="violet"
        />
      </div>

      {/* Recent tenants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Warung Terbaru</CardTitle>
            <CardDescription>
              Diurutkan berdasarkan update terakhir
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/tenants">
              Lihat semua
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {recentTenants.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Store
                className="mx-auto mb-3 size-10 text-muted-foreground/50"
                aria-hidden
              />
              <p className="text-sm font-medium">Belum ada warung</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mulai input warung pertama dari survey lapangan kamu.
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/admin/tenants/new">
                  <Plus className="size-4" />
                  Tambah Warung Pertama
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {recentTenants.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 sm:px-6"
                >
                  {/* Avatar */}
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

                  {/* Meta */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.nama}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.alamat ?? "Alamat belum diset"}
                    </p>
                  </div>

                  {/* Status */}
                  <Badge
                    variant={t.is_active ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {t.is_active ? "Aktif" : "Tutup"}
                  </Badge>

                  {/* Actions */}
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    <Link href={`/admin/tenants/${t.id}/edit`}>Edit</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---------- StatCard ----------

const accentMap = {
  amber: "bg-amber-500/10 text-amber-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  sky: "bg-sky-500/10 text-sky-600",
  violet: "bg-violet-500/10 text-violet-600",
} as const

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  subtitle?: string
  accent: keyof typeof accentMap
}

function StatCard({ icon: Icon, label, value, subtitle, accent }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
            {subtitle ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accentMap[accent]}`}
          >
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
