"use client"

/**
 * ThemeProvider — placeholder light-only untuk MVP.
 *
 * Saat butuh dark mode, install next-themes:
 *   pnpm add next-themes
 *
 * Lalu replace isi file ini dengan:
 *
 *   "use client"
 *   import { ThemeProvider as NextThemesProvider } from "next-themes"
 *
 *   export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
 *     return <NextThemesProvider {...props}>{children}</NextThemesProvider>
 *   }
 *
 * Dan pass props di app/layout.tsx:
 *   <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
