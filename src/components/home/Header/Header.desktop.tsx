import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"

const BoltIcon = () => (
  <svg width="18" height="24" viewBox="0 0 14 22" fill="none">
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

export default function HeaderDesktop() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fecha o dropdown ao clicar fora.
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [menuOpen])

  return (
    <header style={{ background: "#0A0A0A", padding: "0 clamp(20px, 4vw, 60px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, height: 68, position: "sticky", top: 0, zIndex: 50 }}>
      <Link to="/" aria-label="Ir para a página inicial" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <BoltIcon />
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "#fff", letterSpacing: 4 }}>LNJJP</div>
          <div style={{ color: "#F0B90B", fontSize: 9, fontWeight: 700, letterSpacing: 2, marginTop: 2 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        </div>
      </Link>
      <nav style={{ display: "flex", gap: "clamp(14px, 1.8vw, 28px)", flexWrap: "wrap", justifyContent: "center" }}>
        {navLinks.map(({ label, href }) => {
          const isActive = pathname === href
          return (
            <Link key={href} to={href} style={{ color: isActive ? "#F0B90B" : "#999", fontSize: 16, fontWeight: 600, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase" }}>
              {label}
            </Link>
          )
        })}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href="https://wa.me/5522981436950" target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, textDecoration: "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0A">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.178 3.178 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.124 1.525 5.857L.057 23.13a.75.75 0 0 0 .92.92l5.273-1.468A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.515-5.17-1.41l-.37-.219-3.827 1.065 1.065-3.827-.219-.37A9.956 9.956 0 0 1 2 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/>
          </svg>
        </a>
        {user ? (
          <Link to="/painel" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "rgba(255,255,255,0.06)", border: "1px solid #333", borderRadius: 6, padding: "7px 16px", cursor: "pointer", textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ color: "#F0B90B", fontSize: 8, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Minha Conta</span>
          </Link>
        ) : (
          // M-05: um único botão "Acessar" com dropdown (Login / Filiar-se).
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid #333", borderRadius: 6, padding: "9px 16px", cursor: "pointer" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span style={{ color: "#F0B90B", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Acessar</span>
              <svg width="10" height="10" viewBox="0 0 10 6" fill="none" stroke="#F0B90B" strokeWidth="1.6" style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path d="M1 1l4 4 4-4" />
              </svg>
            </button>
            {menuOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, background: "#161616", border: "1px solid #2e2e2e", borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", minWidth: 160, overflow: "hidden", zIndex: 60 }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 16px", color: "#ddd", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #242424" }}>
                  Login
                </Link>
                <Link to="/cadastro" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 16px", color: "#F0B90B", fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase" }}>
                  Filiar-se
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
