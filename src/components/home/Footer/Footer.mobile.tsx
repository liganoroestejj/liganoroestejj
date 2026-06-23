import { Link } from "react-router-dom"

const BoltIcon = () => (
  <svg width="12" height="16" viewBox="0 0 14 22" fill="none">
    <path d="M9 0L2 12h5l-2 10 9-13H9L11 0z" fill="#F0B90B" />
  </svg>
)

const links = [
  { label: "Calendário", to: "/calendario" },
  { label: "Ranking", to: "/ranking" },
  { label: "Filiação", to: "/cadastro" },
]

const linkStyle = { color: "#F0B90B", fontSize: 11, textDecoration: "none" } as const

export default function FooterMobile() {
  return (
    <footer style={{ background: "#0A0A0A", padding: 24, textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
        <BoltIcon />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, color: "#fff", letterSpacing: 4 }}>LNJJP</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 14 }}>
        {links.map(l => <Link key={l.label} to={l.to} style={linkStyle}>{l.label}</Link>)}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <a href="https://wa.me/5522981436950" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ display: "flex" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#F0B90B"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.178 3.178 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.124 1.525 5.857L.057 23.13a.75.75 0 0 0 .92.92l5.273-1.468A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.515-5.17-1.41l-.37-.219-3.827 1.065 1.065-3.827-.219-.37A9.956 9.956 0 0 1 2 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/></svg>
        </a>
        <a href="mailto:liganoroestejj@gmail.com" style={{ display: "flex", alignItems: "center", gap: 6, color: "#F0B90B", fontSize: 11, textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>
          liganoroestejj@gmail.com
        </a>
      </div>
      <div style={{ color: "#F0B90B", fontSize: 10, letterSpacing: 1.5 }}>© {new Date().getFullYear()} Liga Noroeste Jiu-Jitsu</div>
    </footer>
  )
}
