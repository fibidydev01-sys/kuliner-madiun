"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { TenantPreviewPanel } from "./tenant-preview-panel"
import { TenantMenuPanel } from "./tenant-menu-panel"
import type { TenantWithProducts } from "@/hooks/use-tenants"

interface TenantDetailContainerProps {
  /** Tenant yang lagi di-select; null = panel closed */
  tenant: TenantWithProducts | null
  /** Distance dari user kalau "Cari Terdekat" aktif */
  distanceMeters?: number | null
  /** Trigger close — dipanggil Sheet/Drawer saat user dismiss */
  onClose: () => void
}

type PanelMode = "preview" | "menu"

/**
 * Responsive container dengan 2-state mode:
 * - Mode A "preview": foto hero + status + tombol Lihat Menu/Hubungi
 * - Mode B "menu": tabs kategori + list menu minimalist + sticky WA CTA
 *
 * Surface:
 * - Desktop (≥768px): Sheet dari kanan
 * - Mobile (<768px): Drawer dari bawah (vaul, swipeable)
 *
 * Transition A→B: in-place replace (1 container, content swap).
 * Saat tenant ganti (klik marker lain), mode auto reset ke "preview".
 * Saat panel close, mode reset ke "preview" supaya buka next kali start dari A.
 */
export function TenantDetailContainer({
  tenant,
  distanceMeters = null,
  onClose,
}: TenantDetailContainerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const isOpen = tenant !== null

  const [mode, setMode] = useState<PanelMode>("preview")

  // Reset mode saat tenant berubah (klik marker lain) atau panel close
  useEffect(() => {
    if (!tenant) {
      // Delay reset sampai close animation selesai supaya gak flicker UI
      const t = setTimeout(() => setMode("preview"), 250)
      return () => clearTimeout(t)
    }
    setMode("preview")
  }, [tenant])

  function handleOpenChange(open: boolean) {
    if (!open) onClose()
  }

  // ---------- Body content (sama untuk Sheet & Drawer) ----------

  const body = tenant ? (
    mode === "preview" ? (
      <TenantPreviewPanel
        tenant={tenant}
        distanceMeters={distanceMeters}
        onShowMenu={() => setMode("menu")}
      />
    ) : (
      <TenantMenuPanel tenant={tenant} />
    )
  ) : null

  // ---------- Title row (dengan back button kalau Mode B) ----------

  const titleRow = tenant ? (
    <div className="flex items-center gap-2">
      {mode === "menu" ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMode("preview")}
          aria-label="Kembali ke ringkasan"
          className="-ml-2 size-8 shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
      ) : null}
      <span className="truncate text-xl font-bold tracking-tight">
        {tenant.nama}
      </span>
    </div>
  ) : null

  // ---------- Desktop: Sheet ----------

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md"
        >
          {tenant ? (
            <>
              <SheetHeader className="shrink-0 border-b px-4 py-3 sm:px-6">
                <SheetTitle asChild>
                  <h2 className="text-left">{titleRow}</h2>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  {mode === "preview"
                    ? `Ringkasan warung ${tenant.nama}`
                    : `Daftar menu warung ${tenant.nama}`}
                </SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    )
  }

  // ---------- Mobile: Drawer ----------

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="flex max-h-[92svh] flex-col">
        {tenant ? (
          <>
            <DrawerHeader className="shrink-0 px-4 pb-2 pt-3 text-left">
              <DrawerTitle asChild>
                <h2>{titleRow}</h2>
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                {mode === "preview"
                  ? `Ringkasan warung ${tenant.nama}`
                  : `Daftar menu warung ${tenant.nama}`}
              </DrawerDescription>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
