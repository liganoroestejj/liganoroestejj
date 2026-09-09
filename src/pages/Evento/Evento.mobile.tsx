import { Link, useParams } from "react-router-dom"
import HeaderMobile from "../../components/home/Header/Header.mobile"
import { getEventById } from "../../data/events"

export default function EventoMobile() {
  const { id } = useParams()
  const evento = getEventById(id)

  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderMobile />
      <section style={{ flex: 1, padding: "20px 20px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Link
          to="/"
          style={{ alignSelf: "flex-start", color: "#F0B90B", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 18 }}
        >
          ← Voltar
        </Link>
        {!evento ? (
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "#fff", letterSpacing: 2, margin: "0 0 16px", textAlign: "center" }}>Evento não encontrado</h1>
        ) : (
          <>
            <div style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Calendário 2026</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#fff", letterSpacing: 1, margin: "0 0 12px", lineHeight: 1.15, textAlign: "center" }}>
              {evento.title}
            </h1>
            <div style={{ width: 48, height: 3, background: "#F0B90B", marginBottom: 18 }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F0B90B", color: "#0A0A0A", fontSize: 12, fontWeight: 800, padding: "5px 12px", borderRadius: 4, marginBottom: 22 }}>
              📅 {evento.date}
            </div>
            <img
              src={evento.img}
              alt={evento.title}
              style={{ width: "100%", height: "auto", display: "block", borderRadius: 8, border: "1px solid #1e1e1e" }}
            />
          </>
        )}
      </section>
    </main>
  )
}
