import HeaderMobile from "../../components/home/Header/Header.mobile"
import FooterMobile from "../../components/home/Footer/Footer.mobile"

const TrophyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14 9 14 2 10 2 10 9"/>
    <path d="M4 9h16v2a8 8 0 0 1-8 8 8 8 0 0 1-8-8V9z"/>
    <path d="M4 9H2v2a4 4 0 0 0 4 4"/>
    <path d="M20 9h2v2a4 4 0 0 1-4 4"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)

const podium = [
  { pos: "2º", height: 48 },
  { pos: "1º", height: 68 },
  { pos: "3º", height: 36 },
]

export default function RankingMobile() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderMobile />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <TrophyIcon />
        </div>
        <div style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#fff", letterSpacing: 6, margin: "0 0 16px", lineHeight: 1 }}>RANKING</h1>
        <div style={{ width: 48, height: 3, background: "#F0B90B", margin: "0 auto 20px" }} />
        <p style={{ color: "#F0B90B", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Em Breve</p>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.8, margin: "0 auto 36px", maxWidth: 300 }}>
          O ranking dos atletas da temporada 2026 será publicado após a primeira etapa. Prepare-se para competir!
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 36 }}>
          {podium.map(({ pos, height }) => (
            <div key={pos} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ color: "#333", fontSize: 10, letterSpacing: 1 }}>{pos}</span>
              <div style={{ width: 44, height, background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px 4px 0 0" }} />
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
