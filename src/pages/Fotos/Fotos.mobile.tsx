import HeaderMobile from "../../components/home/Header/Header.mobile"
import FooterMobile from "../../components/home/Footer/Footer.mobile"

const CameraIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

export default function FotosMobile() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderMobile />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <CameraIcon />
        </div>
        <div style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#fff", letterSpacing: 6, margin: "0 0 16px", lineHeight: 1 }}>FOTOS</h1>
        <div style={{ width: 48, height: 3, background: "#F0B90B", margin: "0 auto 20px" }} />
        <p style={{ color: "#F0B90B", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Em Breve</p>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.8, margin: "0 auto 36px", maxWidth: 300 }}>
          A galeria com os melhores momentos dos nossos campeonatos será disponibilizada em breve.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 48px)", gridTemplateRows: "repeat(2, 48px)", gap: 3, marginBottom: 36 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1e1e1e" }} />
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
