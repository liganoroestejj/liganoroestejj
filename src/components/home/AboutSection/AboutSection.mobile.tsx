const metrics = [
  { n: "50",  sym: "+", label: "Atletas" },
  { n: "15",  sym: "+", label: "Academias" },
  { n: "6",   sym: "×", label: "Etapas" },
]

export default function AboutSectionMobile() {
  return (
    <section style={{ padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 18, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 9, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Quem Somos</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 33, color: "#0A0A0A", letterSpacing: 1, marginBottom: 20 }}>Liga Noroeste</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ border: "1px solid #eee", borderRadius: 8, padding: "14px 8px", textAlign: "center", borderTop: "2px solid #F0B90B" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 29, color: "#0A0A0A", lineHeight: 1 }}>
              {m.n}<span style={{ color: "#F0B90B" }}>{m.sym}</span>
            </div>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#aaa", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 3 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.8, borderLeft: "3px solid #F0B90B", paddingLeft: 14 }}>
        Valorizando o Jiu-Jitsu na <strong style={{ color: "#0A0A0A" }}>região Noroeste Fluminense</strong> com eventos de alto nível para atletas de todas as faixas.
      </p>
    </section>
  )
}
