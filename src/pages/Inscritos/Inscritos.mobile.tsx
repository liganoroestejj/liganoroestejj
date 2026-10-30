import { Link } from "react-router-dom"
import HeaderMobile from "../../components/home/Header/Header.mobile"
import { BELT_LABELS, GENDER_LABELS } from "../../lib/affiliateOptions"
import { useInscritos } from "./useInscritos"
import { Avatar, estadoDaTela, Filtros, Resumo } from "./inscritosShared"

export default function InscritosMobile() {
  const st = useInscritos()
  const estado = estadoDaTela(st)

  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderMobile />
      <section style={{ flex: 1, padding: "20px 16px 40px" }}>
        <Link
          to={st.evento ? `/evento/${st.evento.id}` : "/"}
          style={{ color: "#F0B90B", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}
        >
          ← Voltar
        </Link>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: "#fff", letterSpacing: 2, margin: "16px 0 4px" }}>
          Inscritos
        </h1>
        {st.evento && <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>{st.evento.title} · {st.evento.date}</div>}

        {estado ?? (
          <>
            <Filtros st={st} isMobile />
            <Resumo st={st} />
            {st.visiveis.length === 0 ? (
              <p style={{ color: "#666", fontSize: 14 }}>Nenhum inscrito para os filtros atuais.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {st.visiveis.map((p) => (
                  <div key={p.uid} style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
                    <Avatar src={p.photoURL} size={44} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.fullName}</div>
                      <div style={{ color: "#888", fontSize: 12, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {st.academyName(p.academyId)}
                      </div>
                      <div style={{ color: "#bbb", fontSize: 12, marginTop: 6 }}>
                        {[
                          p.category,
                          p.age !== null ? `${p.age} anos` : null,
                          BELT_LABELS[p.belt],
                          p.gender ? GENDER_LABELS[p.gender] : null,
                          p.weightClass,
                        ].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
