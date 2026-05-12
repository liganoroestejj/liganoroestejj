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
      <button style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 11, fontWeight: 800, padding: "10px 22px", borderRadius: 5, letterSpacing: 1.5, textTransform: "uppercase", border: "none", cursor: "pointer" }}>
        Fazer Filiação
      </button>
    </header>
  )
}
