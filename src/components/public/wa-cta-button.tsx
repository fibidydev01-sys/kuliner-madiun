"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { generateWALink } from "@/lib/wa"
import { cn } from "@/lib/utils"

type ButtonProps = React.ComponentProps<typeof Button>

interface WaCtaButtonProps extends Omit<ButtonProps, "asChild"> {
  /** Nomor WA tenant (62xx atau 08xx — auto-normalize via generateWALink) */
  nomorWa: string
  /** Pre-filled message yang muncul di WA app */
  message: string
  children: React.ReactNode
}

/**
 * Tombol WhatsApp dengan default styling brand WA hijau.
 * Buka chat di tab/app baru dengan message pre-filled.
 *
 * @example
 * <WaCtaButton
 *   nomorWa={tenant.nomor_wa}
 *   message={`Halo ${tenant.nama}! Saya mau pesan ${product.nama}.`}
 *   size="sm"
 * >
 *   <MessageCircle className="size-4" /> Pesan
 * </WaCtaButton>
 */
export function WaCtaButton({
  nomorWa,
  message,
  children,
  className,
  ...rest
}: WaCtaButtonProps) {
  const href = generateWALink(nomorWa, message)

  return (
    <Button
      asChild
      className={cn(
        "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/40",
        className
      )}
      {...rest}
    >
      <a href={href} target="_blank" rel="noopener">
        {children}
      </a>
    </Button>
  )
}