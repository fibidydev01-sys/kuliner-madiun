import { Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  CategoryDeleteButton,
  CategoryFormDialog,
} from "@/components/admin/category-form"
import { EmptyState } from "@/components/shared/empty-state"
import { Tag as TagIcon, Edit } from "lucide-react"

export const metadata = { title: "Kategori" }

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("urutan", { ascending: true })

  const items = categories ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} kategori · digunakan untuk grouping menu
          </p>
        </div>

        <CategoryFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Tambah Kategori
            </Button>
          }
        />
      </div>

      {/* List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={TagIcon}
              title="Belum ada kategori"
              description="Default seed: Makanan + Minuman. Tambah custom kategori jika perlu (contoh: Kopi, Jajanan)."
              action={
                <CategoryFormDialog
                  trigger={
                    <Button>
                      <Plus className="size-4" />
                      Buat Kategori Pertama
                    </Button>
                  }
                />
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daftar Kategori</CardTitle>
            <CardDescription>
              Diurutkan berdasarkan field "urutan" (kecil → besar).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {items.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center gap-4 px-4 py-3 sm:px-6"
                >
                  {/* Icon */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-xl">
                    {cat.icon}
                  </div>

                  {/* Meta */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{cat.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      Urutan: {cat.urutan}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <CategoryFormDialog
                      category={cat}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${cat.nama}`}
                        >
                          <Edit className="size-4" />
                        </Button>
                      }
                    />
                    <CategoryDeleteButton category={cat} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
