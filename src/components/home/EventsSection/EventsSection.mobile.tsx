import camp1 from "../../../assets/image/campeonato1.jpg"
import camp2 from "../../../assets/image/campeonato2.jpeg"
import camp3 from "../../../assets/image/campeonato3.webp"

const events = [
  { etapa: "1ª", date: "Em breve", city: "Em breve", open: false, img: camp1 },
  { etapa: "2ª", date: "Em breve", city: "Em breve", open: false, img: camp2 },
  { etapa: "3ª", date: "Em breve", city: "Em breve", open: false, img: camp3 },
]

export default function EventsSectionMobile() {
  return (
    <section style={{ padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 18, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 9, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Próximos Eventos</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 33, color: "#0A0A0A", letterSpacing: 1, marginBottom: 20 }}>Calendário 2026</h2>
      {events.map((e, i) => (
        <div key={i} style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden", display: "flex", marginBottom: 12 }}>
          <div style={{ width: 72, position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <img src={e.img} alt={`Etapa ${e.etapa}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 35, color: "#F0B90B", lineHeight: 1 }}>{e.etapa}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: "#ccc", letterSpacing: 1.5, textTransform: "uppercase" }}>Etapa</span>
            </div>
          </div>
          <div style={{ padding: "12px 16px", flex: 1 }}>
            {e.open && <div style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 8, fontWeight: 800, padding: "2px 8px", borderRadius: 3, display: "inline-block", marginBottom: 6 }}>Inscrições Abertas</div>}
            <div style={{ background: "#0A0A0A", color: "#F0B90B", fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 3, display: "inline-block", marginBottom: 5 }}>{e.date}</div>
            <div style={{ color: "#999", fontSize: 12 }}>📍 {e.city}</div>
          </div>
        </div>
      ))}
    </section>
  )
}
