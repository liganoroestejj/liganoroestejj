export default function AboutSectionMobile() {
  return (
    <section style={{ padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 18, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 9, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Quem Somos</span>
      </div>
      {/* MELH-08: estatísticas removidas daqui — mantidas só no StatsBar do topo. */}
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 33, color: "#0A0A0A", letterSpacing: 1, marginBottom: 20 }}>Liga Noroeste</h2>
      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.8, borderLeft: "3px solid #F0B90B", paddingLeft: 14 }}>
        Valorizando o Jiu-Jitsu na <strong style={{ color: "#0A0A0A" }}>região Noroeste Fluminense</strong> com eventos de alto nível para atletas de todas as faixas.
      </p>
    </section>
  )
}
