import HeaderMobile from "../../components/home/Header/Header.mobile"
import FooterMobile from "../../components/home/Footer/Footer.mobile"

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

export default function AcademiasMobile() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderMobile />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <ShieldIcon />
        </div>
        <div style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#fff", letterSpacing: 6, margin: "0 0 16px", lineHeight: 1 }}>ACADEMIAS</h1>
        <div style={{ width: 48, height: 3, background: "#F0B90B", margin: "0 auto 20px" }} />
        <p style={{ color: "#F0B90B", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Em Breve</p>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.8, margin: "0 auto 36px", maxWidth: 300 }}>
          Em breve todas as academias filiadas estarão listadas aqui. Encontre um time na sua cidade!
        </p>
        <div style={{ display: "flex", gap: 20, marginBottom: 36 }}>
          {["Filiadas", "Professores", "Regiões"].map(item => (
            <div key={item} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 40, height: 40, border: "1px solid #222", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 12, height: 12, background: "#222", borderRadius: "50%" }} />
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
