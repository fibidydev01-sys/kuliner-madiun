"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, LogOut, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { BRAND_NAME } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ADMIN_NAV_ITEMS,
  NavLink,
  isNavActive,
} from "@/components/admin/admin-sidebar"

interface AdminTopbarProps {
  userEmail: string
}

export function AdminTopbar({ userEmail }: AdminTopbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const pageTitle = getPageTitle(pathname)
  const initial = userEmail.charAt(0).toUpperCase() || "A"

  async function handleLogout() {
    setIsLoggingOut(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error("Gagal logout", { description: error.message })
      setIsLoggingOut(false)
      return
    }

    toast.success("Logout berhasil")
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile menu trigger */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Buka menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="h-14 border-b px-6">
            <SheetTitle className="text-base">{BRAND_NAME}</SheetTitle>
          </SheetHeader>

          <nav className="space-y-1 p-3">
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isNavActive(pathname, item)}
                onClick={() => setMobileNavOpen(false)}
              />
            ))}
          </nav>

          <div className="border-t p-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileNavOpen(false)}
            >
              <ExternalLink className="size-4" aria-hidden />
              Lihat peta publik
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* Breadcrumb / page title */}
      <h2 className="min-w-0 flex-1 truncate text-sm font-medium">
        {pageTitle}
      </h2>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Akun"
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-xs font-normal text-muted-foreground">
              Masuk sebagai
            </span>
            <span className="truncate font-medium">{userEmail}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/" target="_blank" rel="noopener">
              <ExternalLink className="size-4" />
              Lihat peta publik
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              handleLogout()
            }}
            disabled={isLoggingOut}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="size-4" />
            {isLoggingOut ? "Logout..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

/**
 * Mapping pathname ke page title (breadcrumb sederhana).
 * Phase 2: route admin masih /admin saja. Sisanya disiapkan untuk Phase 3.
 */
function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard"
  if (pathname.startsWith("/admin/tenants/new")) return "Tambah Warung"
  if (pathname.match(/^\/admin\/tenants\/[^/]+\/products/))
    return "Menu Warung"
  if (pathname.match(/^\/admin\/tenants\/[^/]+\/edit/)) return "Edit Warung"
  if (pathname === "/admin/tenants") return "Warung"
  if (pathname.startsWith("/admin/categories")) return "Kategori"
  return "Admin"
}
