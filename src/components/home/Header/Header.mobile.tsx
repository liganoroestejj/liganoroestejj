import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"

const BoltIcon = () => (
  <svg width="14" height="18" viewBox="0 0 14 22" fill="none">
    <path d="M9 0L2 12h5l-2 10 9-13H9L11 0z" fill="#F0B90B" />
  </svg>
)

const authBtn: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "rgba(255,255,255,0.06)", border: "1px solid #333", borderRadius: 6, padding: "5px 9px", textDecoration: "none" }
const authLbl: React.CSSProperties = { color: "#F0B90B", fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }

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
  const { user } = useAuth()
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
        <div style={{ justifySelf: "end", display: "flex", gap: 6 }}>
          {!user && (
            <Link to="/cadastro" aria-label="Filiar-se" style={authBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              <span style={authLbl}>Filiar</span>
            </Link>
          )}
          <Link to={user ? "/painel" : "/login"} aria-label={user ? "Minha conta" : "Login"} style={authBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span style={authLbl}>{user ? "Conta" : "Login"}</span>
          </Link>
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
