import HeaderDesktop from "../../components/home/Header/Header.desktop"
import FooterDesktop from "../../components/home/Footer/Footer.desktop"

const TrophyIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14 9 14 2 10 2 10 9"/>
    <path d="M4 9h16v2a8 8 0 0 1-8 8 8 8 0 0 1-8-8V9z"/>
    <path d="M4 9H2v2a4 4 0 0 0 4 4"/>
    <path d="M20 9h2v2a4 4 0 0 1-4 4"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)

const podium = [
  { pos: "2º", height: 64 },
  { pos: "1º", height: 88 },
  { pos: "3º", height: 48 },
]

export default function RankingDesktop() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderDesktop />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 60px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <TrophyIcon />
        </div>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>Liga Noroeste Jiu-Jitsu Pro</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 88, color: "#fff", letterSpacing: 8, margin: "0 0 20px", lineHeight: 1 }}>RANKING</h1>
        <div style={{ width: 60, height: 3, background: "#F0B90B", margin: "0 auto 28px" }} />
        <p style={{ color: "#F0B90B", fontSize: 14, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700, marginBottom: 20 }}>Em Breve</p>
        <p style={{ color: "#555", fontSize: 15, maxWidth: 500, lineHeight: 1.8, margin: "0 auto 48px" }}>
          O ranking oficial dos atletas da temporada 2026 será publicado após a conclusão
          da primeira etapa. Prepare-se para competir e conquistar seu lugar no topo.
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 48 }}>
          {podium.map(({ pos, height }) => (
            <div key={pos} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#333", fontSize: 11, letterSpacing: 1 }}>{pos}</span>
              <div style={{ width: 56, height, background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px 4px 0 0" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#333", fontSize: 11, letterSpacing: 3 }}>
          <span style={{ width: 40, height: 1, background: "#1e1e1e" }} />
          AGUARDE O INÍCIO DA TEMPORADA
          <span style={{ width: 40, height: 1, background: "#1e1e1e" }} />
        </div>
      </section>
      <FooterDesktop />
    </main>
  )
}
