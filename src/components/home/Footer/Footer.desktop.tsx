const BoltIcon = () => (
  <svg width="18" height="24" viewBox="0 0 14 22" fill="none">
    <path d="M9 0L2 12h5l-2 10 9-13H9L11 0z" fill="#F0B90B" />
  </svg>
)

const links = ["Calendário de Eventos", "Ranking 2026", "Fazer Filiação", "Academias Filiadas"]

export default function FooterDesktop() {
  return (
    <footer style={{ background: "#0A0A0A", padding: "48px 60px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 32, marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <BoltIcon />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#fff", letterSpacing: 4 }}>LNJJP</span>
          </div>
          <div style={{ color: "#F0B90B", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 12 }}>Liga Noroeste Jiu-Jitsu Pro</div>
          <p style={{ color: "#F0B90B", fontSize: 12, lineHeight: 1.8 }}>Valorizando e profissionalizando o Jiu-Jitsu na região Noroeste Fluminense desde 2022.</p>
        </div>
        <div>
          <div style={{ color: "#F0B90B", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #2a2a2a" }}>Links Rápidos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {links.map(l => <a key={l} href="#" style={{ color: "#F0B90B", fontSize: 13, textDecoration: "none" }}>{l}</a>)}
          </div>
        </div>
        <div>
          <div style={{ color: "#F0B90B", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #2a2a2a" }}>Contato</div>
          <div style={{ color: "#F0B90B", fontSize: 13, lineHeight: 2 }}>WhatsApp<br />Instagram<br />contato@liganoroeste.com.br</div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 20, color: "#F0B90B", fontSize: 11, textAlign: "center", letterSpacing: 1.5 }}>
        © {new Date().getFullYear()} Liga Noroeste Jiu-Jitsu · Todos os direitos reservados
      </div>
    </footer>
  )
}
