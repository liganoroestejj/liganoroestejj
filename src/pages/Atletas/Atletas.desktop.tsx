import HeaderDesktop from "../../components/home/Header/Header.desktop"
import FooterDesktop from "../../components/home/Footer/Footer.desktop"

const AtletaIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/>
    <path d="M6.5 8.5 4 19h4l2-5 2 5h4l-2.5-10.5"/>
    <path d="M9 8.5 6.5 11l2.5 2"/>
    <path d="M15 8.5 17.5 11 15 13"/>
  </svg>
)

export default function AtletasDesktop() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderDesktop />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 60px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <AtletaIcon />
        </div>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 88, color: "#fff", letterSpacing: 8, margin: "0 0 20px", lineHeight: 1 }}>ATLETAS</h1>
        <div style={{ width: 60, height: 3, background: "#F0B90B", margin: "0 auto 28px" }} />
        <p style={{ color: "#F0B90B", fontSize: 14, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700, marginBottom: 20 }}>Em Breve</p>
        <p style={{ color: "#555", fontSize: 15, maxWidth: 500, lineHeight: 1.8, margin: "0 auto 48px" }}>
          Em breve você poderá consultar o perfil completo de todos os atletas filiados à liga,
          incluindo histórico de competições, medalhas e faixa atual.
        </p>
        <div style={{ display: "flex", gap: 32, marginBottom: 48 }}>
          {["Filiados", "Faixas", "Medalhas"].map(item => (
            <div key={item} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 48, height: 48, border: "1px solid #222", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 8, height: 16, background: "#222", borderRadius: 2 }} />
              </div>
              <span style={{ color: "#333", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#333", fontSize: 11, letterSpacing: 3 }}>
          <span style={{ width: 40, height: 1, background: "#1e1e1e" }} />
          CADASTROS EM ANDAMENTO
          <span style={{ width: 40, height: 1, background: "#1e1e1e" }} />
        </div>
      </section>
      <FooterDesktop />
    </main>
  )
}
