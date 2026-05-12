const metrics = [
  { n: "500", sym: "+", label: "Atletas Filiados" },
  { n: "20",  sym: "+", label: "Academias Parceiras" },
  { n: "8",   sym: "×", label: "Etapas por Temporada" },
]

export default function AboutSectionDesktop() {
  return (
    <section style={{ padding: "64px 60px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 24, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 10, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>Quem Somos</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#0A0A0A", letterSpacing: 1, lineHeight: 1, marginBottom: 32 }}>Conheça a Liga Noroeste</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ border: "1px solid #eee", borderRadius: 10, padding: 22, textAlign: "center", borderTop: "3px solid #F0B90B" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: "#0A0A0A", lineHeight: 1 }}>
              {m.n}<span style={{ color: "#F0B90B" }}>{m.sym}</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, color: "#aaa", textTransform: "uppercase", marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#666", lineHeight: 1.8, borderLeft: "3px solid #F0B90B", paddingLeft: 16 }}>
        A Liga Noroeste foi criada para <strong style={{ color: "#0A0A0A" }}>valorizar e profissionalizar o Jiu-Jitsu na região Noroeste Fluminense</strong>, trazendo eventos oficiais de alto nível para atletas e academias.<br /><br />
        Trabalhamos para que cada evento seja <strong style={{ color: "#0A0A0A" }}>inclusivo, acessível e bem organizado</strong> para atletas de todas as faixas.
      </p>
    </section>
  )
}
