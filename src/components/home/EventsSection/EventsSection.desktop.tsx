import { Link } from "react-router-dom"
import { events, hasDate } from "../../../data/events"

export default function EventsSectionDesktop() {
  return (
    <section style={{ padding: "64px 60px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 24, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 12, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>Próximos Eventos</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 46, color: "#0A0A0A", letterSpacing: 1, lineHeight: 1, marginBottom: 32 }}>Calendário 2026</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {events.map((e) => {
          const clicavel = hasDate(e)
          const card = (
            <div
              style={{
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #eee",
                background: "#fff",
                cursor: clicavel ? "pointer" : "default",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={clicavel ? (ev) => {
                ev.currentTarget.style.transform = "scale(1.04)"
                ev.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.18)"
              } : undefined}
              onMouseLeave={clicavel ? (ev) => {
                ev.currentTarget.style.transform = "scale(1)"
                ev.currentTarget.style.boxShadow = "none"
              } : undefined}
            >
              <div style={{ height: 110, position: "relative", overflow: "hidden" }}>
                <img src={e.img} alt={`Etapa ${e.etapa}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
                {e.open && <span style={{ position: "absolute", top: 10, left: 12, background: "#F0B90B", color: "#0A0A0A", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 3, letterSpacing: 1 }}>Inscrições Abertas</span>}
                <span style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", fontFamily: "'Bebas Neue', sans-serif", fontSize: 62, color: "#F0B90B", lineHeight: 1 }}>{e.etapa}</span>
                <span style={{ position: "absolute", top: 10, right: 12, color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>ETAPA</span>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0A0A0A", color: "#F0B90B", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 4, marginBottom: 7 }}>
                  📅 {e.date}
                </div>
                <div style={{ color: "#888", fontSize: 12 }}>📍 {e.city}</div>
              </div>
            </div>
          )

          return clicavel ? (
            <Link key={e.id} to={`/evento/${e.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              {card}
            </Link>
          ) : (
            <div key={e.id}>{card}</div>
          )
        })}
      </div>
    </section>
  )
}
