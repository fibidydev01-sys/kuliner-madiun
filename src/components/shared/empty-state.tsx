import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Reusable empty state untuk:
 * - "Belum ada warung di area ini" (peta kosong)
 * - "Belum ada menu" (admin manage produk)
 * - "Tenant tidak ditemukan" (search kosong)
 *
 * @example
 * <EmptyState
 *   icon={MapPin}
 *   title="Belum ada warung di area ini"
 *   description="Geser peta ke area lain atau hubungi admin."
 * />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center px-4 py-12",
        className
      )}
    >
      {Icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon className="size-6 text-muted-foreground" aria-hidden />
        </div>
      ) : null}

      <h3 className="text-base font-semibold text-foreground">{title}</h3>

      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
