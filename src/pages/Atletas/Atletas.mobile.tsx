import HeaderMobile from "../../components/home/Header/Header.mobile"
import FooterMobile from "../../components/home/Footer/Footer.mobile"

const AtletaIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/>
    <path d="M6.5 8.5 4 19h4l2-5 2 5h4l-2.5-10.5"/>
    <path d="M9 8.5 6.5 11l2.5 2"/>
    <path d="M15 8.5 17.5 11 15 13"/>
  </svg>
)

export default function AtletasMobile() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderMobile />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <AtletaIcon />
        </div>
        <div style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#fff", letterSpacing: 6, margin: "0 0 16px", lineHeight: 1 }}>ATLETAS</h1>
        <div style={{ width: 48, height: 3, background: "#F0B90B", margin: "0 auto 20px" }} />
        <p style={{ color: "#F0B90B", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Em Breve</p>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.8, margin: "0 auto 36px", maxWidth: 300 }}>
          Em breve você poderá ver o perfil completo dos atletas filiados com histórico e conquistas.
        </p>
        <div style={{ display: "flex", gap: 20, marginBottom: 36 }}>
          {["Filiados", "Faixas", "Medalhas"].map(item => (
            <div key={item} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 40, height: 40, border: "1px solid #222", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 6, height: 12, background: "#222", borderRadius: 2 }} />
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
