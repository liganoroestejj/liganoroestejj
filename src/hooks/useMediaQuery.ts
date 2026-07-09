import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [query])

  return matches
}

// Breakpoint único para alternar layout desktop/mobile (BUG-19).
// Elevado de 1024 para 1180: o header desktop colidia (links invadindo os
// botões) em telas estreitas ou com zoom de 125%; colapsar mais cedo no menu
// hambúrguer evita a sobreposição e atende ao WCAG 1.4.4.
export const MOBILE_QUERY = "(max-width: 1180px)"

/** true quando a viewport está no layout mobile (ver MOBILE_QUERY). */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY)
}
