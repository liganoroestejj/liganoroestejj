import { useState } from "react"

const faqs = [
  { q: "Quando acontecem os campeonatos de 2026?", a: "Os campeonatos são realizados ao longo do ano. Confira o calendário completo na seção Calendário." },
  { q: "Como posso acessar o ranking atualizado?",  a: "O ranking é atualizado após cada etapa e pode ser acessado na seção Ranking, filtrando por ano e categoria." },
  { q: "Como fazer minha filiação ou renovação?",   a: "Acesse a seção Atletas > Nova Filiação para se filiar, ou Atletas > Renovação para renovar sua carteirinha." },
  { q: "A filiação é obrigatória para competir?",   a: "Sim, a filiação é obrigatória para participar de todos os campeonatos oficiais da Liga Noroeste." },
]

export default function FaqSectionDesktop() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ padding: "64px 60px", background: "#F9F9F7" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 24, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 12, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>Dúvidas</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 46, color: "#0A0A0A", letterSpacing: 1, lineHeight: 1, marginBottom: 32 }}>Perguntas Frequentes</h2>
      {faqs.map((f, i) => (
        <div key={i} style={{ borderBottom: "1px solid #eee", borderTop: i === 0 ? "1px solid #eee" : "none" }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0A", letterSpacing: 0.5, textTransform: "uppercase", textAlign: "left" }}>{f.q}</span>
            <div style={{ width: 26, height: 26, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 16 }}>
              <svg viewBox="0 0 10 10" fill="none" stroke="#0A0A0A" strokeWidth="2" width="13" height="13">
                {open === i
                  ? <line x1="2" y1="5" x2="8" y2="5"/>
                  : <><line x1="5" y1="2" x2="5" y2="8"/><line x1="2" y1="5" x2="8" y2="5"/></>
                }
              </svg>
            </div>
          </button>
          {open === i && <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, paddingBottom: 18 }}>{f.a}</p>}
        </div>
      ))}
    </section>
  )
}
