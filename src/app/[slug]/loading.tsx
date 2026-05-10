import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading skeleton untuk halaman detail warung (/[slug]).
 *
 * Match struktur visual dari TenantDetailHeader + TenantMenuList
 * supaya transisi loading → loaded tidak terasa "jumpy".
 *
 * Render saat Server Component fetch dari Supabase masih in-flight
 * (cold start ~500ms-1s).
 */
export default function TenantDetailLoading() {
  return (
    <main className="min-h-svh bg-muted/20 pb-12">
      {/* === Hero header skeleton === */}
      <header className="relative">
        {/* Hero foto */}
        <div className="relative aspect-[16/10] w-full bg-muted sm:aspect-[21/9]">
          <Skeleton className="size-full rounded-none" />
        </div>

        {/* Info card overlap */}
        <div className="relative z-10 -mt-10 px-4 sm:-mt-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-xl border bg-card p-5 shadow-lg sm:p-6">
            {/* Title + status badge */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4 sm:h-9" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>

            {/* Deskripsi (2 lines) */}
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Meta — alamat + jam */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-4 shrink-0 rounded-sm" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-4 shrink-0 rounded-sm" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            {/* WA CTA */}
            <div className="mt-5 border-t pt-5">
              <Skeleton className="h-11 w-full sm:w-56" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
          </div>
        </div>
      </header>

      {/* === Menu list skeleton === */}
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Section header */}
        <div className="flex items-baseline justify-between gap-3">
          <Skeleton className="h-7 w-20 sm:h-8 sm:w-24" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>

        {/* Menu items (4 placeholder) */}
        <ul className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border bg-card p-3 sm:gap-4 sm:p-4"
            >
              {/* Foto */}
              <Skeleton className="size-20 shrink-0 rounded-md sm:size-24" />

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />

                {/* Footer: harga + CTA */}
                <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                  <Skeleton className="h-6 w-20 sm:h-7 sm:w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
