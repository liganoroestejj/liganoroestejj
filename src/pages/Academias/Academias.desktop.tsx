import HeaderDesktop from "../../components/home/Header/Header.desktop"
import FooterDesktop from "../../components/home/Footer/Footer.desktop"

const ShieldIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

export default function AcadesmiasDesktop() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderDesktop />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 60px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <ShieldIcon />
        </div>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 88, color: "#fff", letterSpacing: 8, margin: "0 0 20px", lineHeight: 1 }}>ACADEMIAS</h1>
        <div style={{ width: 60, height: 3, background: "#F0B90B", margin: "0 auto 28px" }} />
        <p style={{ color: "#F0B90B", fontSize: 14, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700, marginBottom: 20 }}>Em Breve</p>
        <p style={{ color: "#555", fontSize: 15, maxWidth: 500, lineHeight: 1.8, margin: "0 auto 48px" }}>
          Em breve você encontrará aqui todas as academias filiadas à Liga Noroeste Jiu-Jitsu Pro.
          Encontre um time na sua cidade e faça parte da nossa família.
        </p>
        <div style={{ display: "flex", gap: 32, marginBottom: 48 }}>
          {["Filiadas", "Professores", "Regiões"].map(item => (
            <div key={item} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 48, height: 48, border: "1px solid #222", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 16, height: 16, background: "#222", borderRadius: "50%" }} />
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
