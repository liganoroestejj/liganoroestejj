const events = [
  { etapa: "1ª", date: "24 Mai", city: "Itaperuna — RJ", open: true },
  { etapa: "2ª", date: "28 Jun", city: "Campos — RJ",    open: false },
]

export default function EventsSectionMobile() {
  return (
    <section style={{ padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 18, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 8, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Próximos Eventos</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#0A0A0A", letterSpacing: 1, marginBottom: 20 }}>Calendário 2025</h2>
      {events.map((e, i) => (
        <div key={i} style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden", display: "flex", marginBottom: 12 }}>
          <div style={{ width: 72, background: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 6px", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: "#F0B90B", lineHeight: 1 }}>{e.etapa}</span>
            <span style={{ fontSize: 7, fontWeight: 700, color: "#555", letterSpacing: 1.5, textTransform: "uppercase" }}>Etapa</span>
          </div>
          <div style={{ padding: "12px 16px", flex: 1 }}>
            {e.open && <div style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 7, fontWeight: 800, padding: "2px 8px", borderRadius: 3, display: "inline-block", marginBottom: 6 }}>Inscrições Abertas</div>}
            <div style={{ background: "#0A0A0A", color: "#F0B90B", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 3, display: "inline-block", marginBottom: 5 }}>{e.date}</div>
            <div style={{ color: "#999", fontSize: 11 }}>📍 {e.city}</div>
          </div>
        </div>
      ))}
    </section>
  )
}
