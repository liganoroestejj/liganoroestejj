import HeaderDesktop from "../../components/home/Header/Header.desktop"
import FooterDesktop from "../../components/home/Footer/Footer.desktop"

const CalendarIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

export default function CalendarioDesktop() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderDesktop />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 60px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <CalendarIcon />
        </div>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 88, color: "#fff", letterSpacing: 8, margin: "0 0 20px", lineHeight: 1 }}>CALENDÁRIO</h1>
        <div style={{ width: 60, height: 3, background: "#F0B90B", margin: "0 auto 28px" }} />
        <p style={{ color: "#F0B90B", fontSize: 14, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700, marginBottom: 20 }}>Em Breve</p>
        <p style={{ color: "#555", fontSize: 15, maxWidth: 500, lineHeight: 1.8, margin: "0 auto 48px" }}>
          O calendário completo de eventos e campeonatos da temporada 2026 será divulgado em breve.
          Acompanhe nossas redes sociais para ficar por dentro de todas as novidades.
        </p>
        <div style={{ display: "flex", gap: 40, marginBottom: 48 }}>
          {["Etapas", "Categorias", "Datas"].map(item => (
            <div key={item} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 48, height: 48, border: "1px solid #222", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 16, height: 16, background: "#222", borderRadius: 2 }} />
              </div>
              <span style={{ color: "#333", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#333", fontSize: 11, letterSpacing: 3 }}>
          <span style={{ width: 40, height: 1, background: "#1e1e1e" }} />
          AGUARDE AS NOVIDADES
          <span style={{ width: 40, height: 1, background: "#1e1e1e" }} />
        </div>
      </section>
      <FooterDesktop />
    </main>
  )
}
