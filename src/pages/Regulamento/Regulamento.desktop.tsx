import { Link, useParams } from "react-router-dom"
import HeaderDesktop from "../../components/home/Header/Header.desktop"
import { getRegulamentoByEventId } from "../../data/regulamentos"

export default function RegulamentoDesktop() {
  const { id } = useParams()
  const regulamento = getRegulamentoByEventId(id)

  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderDesktop />
      <section style={{ flex: 1, padding: "32px 60px 64px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Link
          to={`/evento/${id}`}
          style={{ alignSelf: "flex-start", color: "#F0B90B", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 24 }}
        >
          ← Voltar ao evento
        </Link>
        {!regulamento ? (
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, color: "#fff", letterSpacing: 4, margin: "0 0 20px" }}>Regulamento não encontrado</h1>
        ) : (
          <>
            <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>Liga Noroeste Jiu-Jitsu Pro</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#fff", letterSpacing: 3, margin: "0 0 12px", lineHeight: 1.1, textAlign: "center" }}>
              {regulamento.titulo}
            </h1>
            <div style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>{regulamento.subtitulo}</div>
            <div style={{ width: 60, height: 3, background: "#F0B90B", marginBottom: 40 }} />

            <article style={{ maxWidth: 820, width: "100%" }}>
              {regulamento.capitulos.map(cap => (
                <div key={cap.titulo} style={{ marginBottom: 36 }}>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#F0B90B", letterSpacing: 2, margin: "0 0 16px", paddingBottom: 8, borderBottom: "1px solid #1e1e1e" }}>
                    {cap.titulo}
                  </h2>
                  {cap.artigos.map(art => (
                    <p key={art.num} style={{ color: "#ccc", fontSize: 15, lineHeight: 1.7, margin: "0 0 14px", whiteSpace: "pre-line" }}>
                      <strong style={{ color: "#F0B90B" }}>{art.num}</strong> {art.texto}
                    </p>
                  ))}
                </div>
              ))}

              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: "24px 28px" }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#F0B90B", letterSpacing: 2, margin: "0 0 14px" }}>
                  {regulamento.quadro.titulo}
                </h2>
                {regulamento.quadro.linhas.map(linha => (
                  <div key={linha} style={{ color: "#ccc", fontSize: 15, lineHeight: 1.8 }}>{linha}</div>
                ))}
              </div>
            </article>
          </>
        )}
      </section>
    </main>
  )
}
