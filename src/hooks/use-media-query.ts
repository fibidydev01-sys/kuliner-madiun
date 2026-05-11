"use client"

import { useEffect, useState } from "react"

/**
 * Hook untuk match CSS media query reactively.
 *
 * @example
 * const isDesktop = useMediaQuery("(min-width: 768px)")
 * return isDesktop ? <Sheet>...</Sheet> : <Drawer>...</Drawer>
 *
 * SSR-safe: initial state = false (assume mobile-first), update di useEffect
 * setelah window tersedia.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [query])

  return matches
}
