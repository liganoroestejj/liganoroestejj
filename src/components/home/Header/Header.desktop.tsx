const BoltIcon = () => (
  <svg width="18" height="24" viewBox="0 0 14 22" fill="none">
    <path d="M9 0L2 12h5l-2 10 9-13H9L11 0z" fill="#F0B90B" />
  </svg>
)

const navLinks = ["Início", "Calendário", "Ranking", "Academias", "Atletas", "Fotos", "Arbitragem"]

export default function HeaderDesktop() {
  return (
    <header style={{ background: "#0A0A0A", padding: "0 60px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68, position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BoltIcon />
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "#fff", letterSpacing: 4 }}>LNJJP</div>
          <div style={{ color: "#F0B90B", fontSize: 9, fontWeight: 700, letterSpacing: 2, marginTop: 2 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 28 }}>
        {navLinks.map((link, i) => (
          <a key={link} href="#" style={{ color: i === 0 ? "#F0B90B" : "#999", fontSize: 16, fontWeight: 600, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase" }}>
            {link}
          </a>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href="https://wa.me/" style={{ width: 38, height: 38, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, textDecoration: "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0A">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.178 3.178 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.124 1.525 5.857L.057 23.13a.75.75 0 0 0 .92.92l5.273-1.468A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.515-5.17-1.41l-.37-.219-3.827 1.065 1.065-3.827-.219-.37A9.956 9.956 0 0 1 2 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/>
          </svg>
        </a>
        <button style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "rgba(255,255,255,0.06)", border: "1px solid #333", borderRadius: 6, padding: "7px 16px", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{ color: "#F0B90B", fontSize: 8, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Login</span>
        </button>
      </div>
    </header>
  )
}
