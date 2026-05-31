import HeaderMobile from "../../components/home/Header/Header.mobile"
import FooterMobile from "../../components/home/Footer/Footer.mobile"

const CalendarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

export default function CalendarioMobile() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderMobile />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <CalendarIcon />
        </div>
        <div style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#fff", letterSpacing: 6, margin: "0 0 16px", lineHeight: 1 }}>CALENDÁRIO</h1>
        <div style={{ width: 48, height: 3, background: "#F0B90B", margin: "0 auto 20px" }} />
        <p style={{ color: "#F0B90B", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Em Breve</p>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.8, margin: "0 auto 36px", maxWidth: 300 }}>
          O calendário completo da temporada 2026 será divulgado em breve. Fique de olho nas nossas redes sociais.
        </p>
        <div style={{ display: "flex", gap: 20, marginBottom: 36 }}>
          {["Etapas", "Categorias", "Datas"].map(item => (
            <div key={item} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 40, height: 40, border: "1px solid #222", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 12, height: 12, background: "#222", borderRadius: 2 }} />
              </div>
              <span style={{ color: "#333", fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#333", fontSize: 10, letterSpacing: 2 }}>
          <span style={{ width: 28, height: 1, background: "#1e1e1e" }} />
          AGUARDE
          <span style={{ width: 28, height: 1, background: "#1e1e1e" }} />
        </div>
      </section>
      <FooterMobile />
    </main>
  )
}
