import { Link, useParams } from "react-router-dom"
import HeaderDesktop from "../../components/home/Header/Header.desktop"
import { getEventById } from "../../data/events"

export default function EventoDesktop() {
  const { id } = useParams()
  const evento = getEventById(id)

  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderDesktop />
      <section style={{ flex: 1, padding: "32px 60px 64px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Link
          to="/"
          style={{ alignSelf: "flex-start", color: "#F0B90B", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 24 }}
        >
          ← Voltar
        </Link>
        {!evento ? (
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, color: "#fff", letterSpacing: 4, margin: "0 0 20px" }}>Evento não encontrado</h1>
        ) : (
          <>
            <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>Calendário 2026</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#fff", letterSpacing: 3, margin: "0 0 16px", lineHeight: 1.1, textAlign: "center" }}>
              {evento.title}
            </h1>
            <div style={{ width: 60, height: 3, background: "#F0B90B", marginBottom: 24 }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F0B90B", color: "#0A0A0A", fontSize: 13, fontWeight: 800, padding: "6px 14px", borderRadius: 4, marginBottom: 32 }}>
              📅 {evento.date}
            </div>
            <img
              src={evento.img}
              alt={evento.title}
              style={{ maxWidth: 900, width: "100%", height: "auto", display: "block", borderRadius: 10, border: "1px solid #1e1e1e" }}
            />
          </>
        )}
      </section>
    </main>
  )
}
