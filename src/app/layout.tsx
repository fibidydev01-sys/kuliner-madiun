import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/shared/theme-provider"
import {
  BRAND_NAME,
  TAGLINE,
  SUB_TAGLINE,
  DEFAULT_CITY_NAME,
} from "@/lib/constants"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

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
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-svh antialiased font-sans">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
