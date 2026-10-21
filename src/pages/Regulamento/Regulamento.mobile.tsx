import { Link, useParams } from "react-router-dom"
import HeaderMobile from "../../components/home/Header/Header.mobile"
import { getRegulamentoByEventId } from "../../data/regulamentos"

export default function RegulamentoMobile() {
  const { id } = useParams()
  const regulamento = getRegulamentoByEventId(id)

  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderMobile />
      <section style={{ flex: 1, padding: "20px 20px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Link
          to={`/evento/${id}`}
          style={{ alignSelf: "flex-start", color: "#F0B90B", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 18 }}
        >
          ← Voltar ao evento
        </Link>
        {!regulamento ? (
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "#fff", letterSpacing: 2, margin: "0 0 16px", textAlign: "center" }}>Regulamento não encontrado</h1>
        ) : (
          <>
            <div style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Liga Noroeste Jiu-Jitsu Pro</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#fff", letterSpacing: 1, margin: "0 0 8px", lineHeight: 1.15, textAlign: "center" }}>
              {regulamento.titulo}
            </h1>
            <div style={{ color: "#888", fontSize: 12, marginBottom: 12, textAlign: "center" }}>{regulamento.subtitulo}</div>
            <div style={{ width: 48, height: 3, background: "#F0B90B", marginBottom: 28 }} />

            <article style={{ width: "100%" }}>
              {regulamento.capitulos.map(cap => (
                <div key={cap.titulo} style={{ marginBottom: 28 }}>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#F0B90B", letterSpacing: 1, margin: "0 0 12px", paddingBottom: 6, borderBottom: "1px solid #1e1e1e", lineHeight: 1.2 }}>
                    {cap.titulo}
                  </h2>
                  {cap.artigos.map(art => (
                    <p key={art.num} style={{ color: "#ccc", fontSize: 14, lineHeight: 1.65, margin: "0 0 12px", whiteSpace: "pre-line" }}>
                      <strong style={{ color: "#F0B90B" }}>{art.num}</strong> {art.texto}
                    </p>
                  ))}
                </div>
              ))}

              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "18px 18px" }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#F0B90B", letterSpacing: 1, margin: "0 0 10px" }}>
                  {regulamento.quadro.titulo}
                </h2>
                {regulamento.quadro.linhas.map(linha => (
                  <div key={linha} style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7 }}>{linha}</div>
                ))}
              </div>
            </article>
          </>
        )}
      </section>
    </main>
  )
}
