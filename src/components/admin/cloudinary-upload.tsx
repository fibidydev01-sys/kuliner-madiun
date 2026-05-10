"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImageIcon, Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { uploadToCloudinary } from "@/lib/cloudinary/upload"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CloudinaryUploadProps {
  value?: { url: string | null; publicId: string | null }
  onChange: (result: { url: string; publicId: string } | null) => void
  className?: string
  /** Label untuk alt text */
  label?: string
  /** Aspect ratio class (default video). Bisa "aspect-square" untuk produk. */
  aspectClass?: string
}

/**
 * Drag/click upload ke Cloudinary unsigned.
 * Auto-upload begitu file dipilih.
 * Parent provide value (initial existing photo) + onChange (called with new url+publicId).
 */
export function CloudinaryUpload({
  value,
  onChange,
  className,
  label = "Foto",
  aspectClass = "aspect-video",
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentUrl = value?.url

  async function handleFile(file: File | undefined) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("File harus gambar (JPG, PNG, WEBP)")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran maksimal 5 MB")
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadToCloudinary(file)
      onChange({ url: result.secure_url, publicId: result.public_id })
      toast.success("Foto berhasil diupload")
    } catch (err) {
      toast.error("Upload gagal", {
        description: err instanceof Error ? err.message : "Coba lagi",
      })
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemove() {
    onChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={isUploading}
      />

      {currentUrl ? (
        <div className={cn("group relative overflow-hidden rounded-md border bg-muted", aspectClass)}>
          <Image
            src={currentUrl}
            alt={label}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Upload className="size-4" /> Ganti
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="size-4" /> Hapus
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={isUploading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed bg-muted/30 transition-colors disabled:opacity-50",
            aspectClass,
            isDragging
              ? "border-primary bg-primary/5"
              : "border-input hover:border-primary/40 hover:bg-muted"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Mengupload...</span>
            </>
          ) : (
            <>
              <ImageIcon className="size-6 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">
                Klik atau drop foto di sini
              </span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WEBP · max 5 MB
              </span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
