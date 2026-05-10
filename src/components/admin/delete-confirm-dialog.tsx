"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DeleteConfirmDialogProps {
  /** Trigger element (Button, DropdownMenuItem dengan onSelect={e => e.preventDefault()}, dll) */
  trigger: React.ReactNode
  /** Nama item yang akan dihapus (untuk warning) */
  itemName: string
  /** Custom title (default: "Hapus permanen?") */
  title?: string
  /** Custom description (default mention itemName) */
  description?: React.ReactNode
  /** Callback async — return promise untuk loading state */
  onConfirm: () => void | Promise<void>
}

/**
 * Reusable confirm dialog buat aksi destructive.
 *
 * @example
 * <DeleteConfirmDialog
 *   itemName={tenant.nama}
 *   description="Semua menu juga akan terhapus."
 *   onConfirm={() => handleDelete(tenant)}
 *   trigger={<Button variant="destructive">Hapus</Button>}
 * />
 */
export function DeleteConfirmDialog({
  trigger,
  itemName,
  title = "Hapus permanen?",
  description,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleConfirm() {
    setIsLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ?? (
              <>
                Anda yakin ingin menghapus <strong>{itemName}</strong>?
                <br />
                Tindakan ini tidak bisa dibatalkan.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Ya, hapus"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
