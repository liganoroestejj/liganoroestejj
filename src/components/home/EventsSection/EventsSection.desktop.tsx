const events = [
  { etapa: "1ª", date: "24 Mai", city: "Itaperuna — RJ", open: true },
  { etapa: "2ª", date: "28 Jun", city: "Campos — RJ",    open: false },
  { etapa: "3ª", date: "19 Jul", city: "Miracema — RJ",  open: false },
]

export default function EventsSectionDesktop() {
  return (
    <section style={{ padding: "64px 60px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 24, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 10, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>Próximos Eventos</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#0A0A0A", letterSpacing: 1, lineHeight: 1, marginBottom: 32 }}>Calendário 2025</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {events.map((e, i) => (
          <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #eee" }}>
            <div style={{ height: 110, background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: 14 }}>
              {e.open && <span style={{ position: "absolute", top: 10, left: 12, background: "#F0B90B", color: "#0A0A0A", fontSize: 8, fontWeight: 800, padding: "3px 8px", borderRadius: 3, letterSpacing: 1 }}>Inscrições Abertas</span>}
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 60, color: "#F0B90B", lineHeight: 1 }}>{e.etapa}</span>
              <span style={{ position: "absolute", top: 10, right: 12, color: "#444", fontSize: 8, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>ETAPA</span>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0A0A0A", color: "#F0B90B", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 4, marginBottom: 7 }}>
                📅 {e.date}
              </div>
              <div style={{ color: "#888", fontSize: 10 }}>📍 {e.city}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
