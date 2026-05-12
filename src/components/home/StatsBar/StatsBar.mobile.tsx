const stats = [
  { n: "500+", label: "Atletas" },
  { n: "8",    label: "Etapas" },
  { n: "20+",  label: "Academias" },
]

export default function StatsBarMobile() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", background: "#F0B90B" }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: "16px 10px", textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(0,0,0,0.15)" : "none" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#0A0A0A", lineHeight: 1 }}>{s.n}</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(0,0,0,0.6)", letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
