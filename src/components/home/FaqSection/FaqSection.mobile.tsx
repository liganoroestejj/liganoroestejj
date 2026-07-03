import { useState } from "react"
import { faqs } from "./faqs"

export default function FaqSectionMobile() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ padding: "32px 24px", background: "#F9F9F7" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 18, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 9, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Dúvidas</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 33, color: "#0A0A0A", letterSpacing: 1, marginBottom: 20 }}>Perguntas Frequentes</h2>
      {faqs.map((f, i) => (
        <div key={i} style={{ borderBottom: "1px solid #eee", borderTop: i === 0 ? "1px solid #eee" : "none" }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0A0A0A", textTransform: "uppercase", textAlign: "left", paddingRight: 10 }}>{f.q}</span>
            <div style={{ width: 22, height: 22, background: "#F0B90B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 10 10" fill="none" stroke="#0A0A0A" strokeWidth="2" width="11" height="11">
                {open === i
                  ? <line x1="2" y1="5" x2="8" y2="5"/>
                  : <><line x1="5" y1="2" x2="5" y2="8"/><line x1="2" y1="5" x2="8" y2="5"/></>
                }
              </svg>
            </div>
          </button>
          {open === i && <p style={{ fontSize: 12, color: "#666", lineHeight: 1.7, paddingBottom: 14 }}>{f.a}</p>}
        </div>
      ))}
    </section>
  )
}
