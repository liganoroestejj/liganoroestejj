import HeaderDesktop from "../../components/home/Header/Header.desktop"
import FooterDesktop from "../../components/home/Footer/Footer.desktop"

const CameraIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)


export default function FotosDesktop() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderDesktop />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 60px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <CameraIcon />
        </div>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 88, color: "#fff", letterSpacing: 8, margin: "0 0 20px", lineHeight: 1 }}>FOTOS</h1>
        <div style={{ width: 60, height: 3, background: "#F0B90B", margin: "0 auto 28px" }} />
        <p style={{ color: "#F0B90B", fontSize: 14, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700, marginBottom: 20 }}>Em Breve</p>
        <p style={{ color: "#555", fontSize: 15, maxWidth: 500, lineHeight: 1.8, margin: "0 auto 48px" }}>
          A galeria de fotos dos campeonatos e eventos da liga será disponibilizada em breve.
          Reviva os melhores momentos das competições da temporada.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 60px)", gridTemplateRows: "repeat(2, 60px)", gap: 4, marginBottom: 48 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#1e1e1e" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#333", fontSize: 11, letterSpacing: 3 }}>
          <span style={{ width: 40, height: 1, background: "#1e1e1e" }} />
          FOTOS EM PRODUÇÃO
          <span style={{ width: 40, height: 1, background: "#1e1e1e" }} />
        </div>
      </section>
      <FooterDesktop />
    </main>
  )
}
