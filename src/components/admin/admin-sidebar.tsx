"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  Tag as TagIcon,
  ExternalLink,
  type LucideIcon,
} from "lucide-react"

import { BRAND_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Match exact path (true) atau startsWith (false) */
  exact?: boolean
}

/**
 * Nav items shared antara sidebar (desktop) dan topbar mobile sheet.
 * Diexport supaya admin-topbar.tsx ga duplikasi list ini.
 */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tenants", label: "Warung", icon: Store },
  { href: "/admin/categories", label: "Kategori", icon: TagIcon },
]

/**
 * Helper: cek active berdasarkan pathname.
 * Diexport supaya bisa dipakai juga di mobile sheet.
 */
export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

/**
 * Desktop fixed sidebar.
 * Hidden on mobile — mobile pakai sheet di topbar.
 */
export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-6">
        <Link
          href="/admin"
          className="text-base font-bold tracking-tight"
          aria-label={BRAND_NAME}
        >
          {BRAND_NAME}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isNavActive(pathname, item)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-4" aria-hidden />
          Lihat peta publik
        </Link>
      </div>
    </aside>
  )
}

// ---------- NavLink (export buat reuse di mobile sheet) ----------

export function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem
  active: boolean
  onClick?: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground/70 hover:bg-muted hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span>{item.label}</span>
    </Link>
  )
}
