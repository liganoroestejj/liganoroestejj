import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

const BoltIcon = () => (
  <svg width="14" height="18" viewBox="0 0 14 22" fill="none">
    <path d="M9 0L2 12h5l-2 10 9-13H9L11 0z" fill="#F0B90B" />
  </svg>
)

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Calendário", href: "/calendario" },
  { label: "Ranking", href: "/ranking" },
  { label: "Academias", href: "/academias" },
  { label: "Atletas", href: "/atletas" },
  { label: "Fotos", href: "/fotos" },
]

export default function HeaderMobile() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  return (
    <>
      <header style={{ background: "#0A0A0A", padding: "0 20px", height: 60, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, justifySelf: "start" }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: "block", width: 24, height: 2, background: "#fff" }} />)}
        </button>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <BoltIcon />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#fff", letterSpacing: 3 }}>LNJJP</span>
        </Link>
        <div style={{ justifySelf: "end" }}>
          <div style={{ width: 36, height: 36, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0A">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.178 3.178 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.124 1.525 5.857L.057 23.13a.75.75 0 0 0 .92.92l5.273-1.468A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.515-5.17-1.41l-.37-.219-3.827 1.065 1.065-3.827-.219-.37A9.956 9.956 0 0 1 2 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/>
            </svg>
          </div>
        </div>
      </header>
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          <div style={{ background: "#0A0A0A", width: "80%", maxWidth: 320, height: "100%", padding: "20px 24px", display: "flex", flexDirection: "column" }}>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 24, alignSelf: "flex-end", marginBottom: 32 }}>✕</button>
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {navLinks.map(({ label, href }) => {
                const isActive = pathname === href
                return (
                  <Link key={href} to={href} onClick={() => setOpen(false)} style={{ color: isActive ? "#F0B90B" : "#ccc", fontSize: 15, fontWeight: 600, textDecoration: "none", padding: "12px 0", borderBottom: "1px solid #1a1a1a", letterSpacing: 1 }}>
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div onClick={() => setOpen(false)} style={{ flex: 1, background: "rgba(0,0,0,0.6)" }} />
        </div>
      )}
    </>
  )
}
