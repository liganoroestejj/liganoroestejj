const stats = [
  { n: "500+", label: "Atletas Filiados" },
  { n: "8",    label: "Etapas em 2025" },
  { n: "20+",  label: "Academias" },
  { n: "3",    label: "Anos de Liga" },
]

const icons = [
  <svg key="a" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  <svg key="b" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  <svg key="c" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  <svg key="d" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" width="18" height="18"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
]

export default function StatsBarDesktop() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "#F0B90B" }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: 20, textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(0,0,0,0.15)" : "none" }}>
          <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}>{icons[i]}</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#0A0A0A", letterSpacing: 1, lineHeight: 1 }}>{s.n}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,0.6)", letterSpacing: 2.5, textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
