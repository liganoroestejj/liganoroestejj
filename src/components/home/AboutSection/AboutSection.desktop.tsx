export default function AboutSectionDesktop() {
  return (
    <section style={{ padding: "64px 60px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 24, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 12, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>Quem Somos</span>
      </div>
      {/* MELH-08: estatísticas removidas daqui — mantidas só no StatsBar do topo. */}
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 46, color: "#0A0A0A", letterSpacing: 1, lineHeight: 1, marginBottom: 32 }}>Conheça a Liga Noroeste</h2>
      <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, borderLeft: "3px solid #F0B90B", paddingLeft: 16 }}>
        A Liga Noroeste foi criada para <strong style={{ color: "#0A0A0A" }}>valorizar e profissionalizar o Jiu-Jitsu na região Noroeste Fluminense</strong>, trazendo eventos oficiais de alto nível para atletas e academias.<br /><br />
        Trabalhamos para que cada evento seja <strong style={{ color: "#0A0A0A" }}>inclusivo, acessível e bem organizado</strong> para atletas de todas as faixas.
      </p>
    </section>
  )
}
