import type { Metadata, Viewport } from "next"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/shared/theme-provider"
import {
  BRAND_NAME,
  TAGLINE,
  SUB_TAGLINE,
  DEFAULT_CITY_NAME,
} from "@/lib/constants"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} — ${TAGLINE}`,
    template: `%s · ${BRAND_NAME}`,
  },
  description: `Peta interaktif PKL & warung kaki lima di ${DEFAULT_CITY_NAME}. Temukan kuliner terdekat, lihat menu & harga, pesan langsung via WhatsApp. ${SUB_TAGLINE}`,
  keywords: [
    "PKL",
    "warung",
    "kaki lima",
    "kuliner Madiun",
    "kuliner Dimong",
    "pecel Madiun",
    "sate Madiun",
    "peta warung",
  ],
  authors: [{ name: BRAND_NAME }],
  openGraph: {
    title: BRAND_NAME,
    description: TAGLINE,
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: BRAND_NAME,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_NAME,
    description: TAGLINE,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-svh antialiased font-sans">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
