import { Link } from "react-router-dom"

const benefits = [
  "Acesso a todos os campeonatos oficiais da Liga",
  "Carteirinha digital com QR Code de verificação",
  "Válido para atletas, professores e academias",
]

export default function MembershipSectionDesktop() {
  return (
    <section style={{ padding: "0 60px 64px" }}>
      <div style={{ background: "#0A0A0A", borderRadius: 12, display: "grid", gridTemplateColumns: "1.4fr 0.6fr", overflow: "hidden" }}>
        <div style={{ padding: 44 }}>
          <div style={{ border: "1px solid #F0B90B", color: "#F0B90B", fontSize: 11, fontWeight: 700, letterSpacing: 4, padding: "4px 14px", display: "inline-block", marginBottom: 18 }}>Filiações Abertas</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 50, color: "#fff", lineHeight: 1, marginBottom: 22 }}>
            Garanta sua<br /><span style={{ color: "#F0B90B" }}>Carteirinha</span>
          </h2>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 18, height: 18, background: "#F0B90B", borderRadius: "50%", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 10 10" fill="none" stroke="#0A0A0A" strokeWidth="2" width="10" height="10"><polyline points="2,5 4,7 8,3"/></svg>
              </div>
              <span style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6 }}>{b}</span>
            </div>
          ))}
          <Link to="/cadastro" style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 13, fontWeight: 800, padding: "14px 24px", borderRadius: 5, display: "inline-block", marginTop: 20, letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: "pointer", textDecoration: "none" }}>
            Quero me Filiar →
          </Link>
        </div>
        <div style={{ background: "#111", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
          <div style={{ width: 110, height: 150, background: "#1a1a1a", border: "1px solid #F0B90B", borderRadius: 8, padding: 12, transform: "rotate(-6deg)", display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 24, height: 24, background: "#F0B90B", borderRadius: 3 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 4, background: "rgba(240,185,11,0.4)", borderRadius: 2, marginBottom: 3 }} />
                <div style={{ height: 4, background: "#333", borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ flex: 1, background: "#222", borderRadius: 4 }} />
            <div style={{ width: 36, height: 36, background: "#111", border: "1px solid #333", borderRadius: 3, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, padding: 4 }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{ background: i % 2 === 0 ? "#444" : "rgba(240,185,11,0.3)", borderRadius: 1 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
