import { Link } from "react-router-dom"
import HeaderDesktop from "../../components/home/Header/Header.desktop"
import { BELT_LABELS, GENDER_LABELS } from "../../lib/affiliateOptions"
import { useInscritos } from "./useInscritos"
import { Avatar, estadoDaTela, Filtros, Resumo } from "./inscritosShared"

const th: React.CSSProperties = { textAlign: "left", color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "14px 12px", borderBottom: "1px solid #222" }
const td: React.CSSProperties = { color: "#ddd", fontSize: 13, padding: "12px", borderBottom: "1px solid #1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }

export default function InscritosDesktop() {
  const st = useInscritos()
  const estado = estadoDaTela(st)

  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderDesktop />
      <section style={{ flex: 1, padding: "32px 60px 64px", maxWidth: 1200, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <Link
          to={st.evento ? `/evento/${st.evento.id}` : "/"}
          style={{ color: "#F0B90B", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}
        >
          ← Voltar
        </Link>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: "#fff", letterSpacing: 3, margin: "20px 0 4px" }}>
          Inscritos confirmados
        </h1>
        {st.evento && <div style={{ color: "#888", fontSize: 14, marginBottom: 28 }}>{st.evento.title} · {st.evento.date}</div>}

        {estado ?? (
          <>
            <Filtros st={st} isMobile={false} />
            <Resumo st={st} />
            {st.visiveis.length === 0 ? (
              <p style={{ color: "#666", fontSize: 14 }}>Nenhum inscrito para os filtros atuais.</p>
            ) : (
              <div className="dark-scroll" style={{ background: "#111", border: "1px solid #222", borderRadius: 10, overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760, tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "28%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "11%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "7%" }} />
                    <col style={{ width: "11%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ ...th, paddingLeft: 22 }}>Atleta</th>
                      <th style={th}>Academia</th>
                      <th style={th}>Faixa</th>
                      <th style={th}>Sexo</th>
                      <th style={th}>Categoria</th>
                      <th style={th}>Idade</th>
                      <th style={th}>Cat. de peso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {st.visiveis.map((p) => (
                      <tr key={p.uid}>
                        <td style={{ ...td, paddingLeft: 22 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                            <Avatar src={p.photoURL} size={36} />
                            <span title={p.fullName} style={{ color: "#fff", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>{p.fullName}</span>
                          </div>
                        </td>
                        <td style={td} title={st.academyName(p.academyId)}>{st.academyName(p.academyId)}</td>
                        <td style={td}>{BELT_LABELS[p.belt] ?? "—"}</td>
                        <td style={td}>{p.gender ? GENDER_LABELS[p.gender] ?? "—" : "—"}</td>
                        <td style={td}>{p.category ?? "—"}</td>
                        <td style={td}>{p.age ?? "—"}</td>
                        <td style={td}>{p.weightClass ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
