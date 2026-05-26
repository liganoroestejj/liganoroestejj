import { useState } from "react"

interface Slide {
  tag: string
  year: string
  line1: string
  line2: string
  sub: string
  badge?: string
  benefits?: string[]
  btns: { label: string; primary: boolean }[]
  wm1: string
  wm2: string
}

const slides: Slide[] = [
  {
    tag: "Federação Up Regional",
    year: "2026",
    line1: "LIGA",
    line2: "NOROESTE",
    sub: "Jiu Jitsu Pro · Região Noroeste Fluminense",
    btns: [
      { label: "Fazer Filiação", primary: true },
      { label: "Ver Calendário", primary: false },
    ],
    wm1: "LIGA",
    wm2: "NOROESTE",
  },
  {
    tag: "Próxima Etapa",
    year: "24 Mai",
    line1: "1ª ETAPA",
    line2: "ITAPERUNA",
    sub: "📍 Itaperuna — RJ · Inscrições Abertas",
    badge: "Inscrições Abertas",
    btns: [
      { label: "Ver Inscrições", primary: true },
      { label: "Ver Calendário", primary: false },
    ],
    wm1: "1ª",
    wm2: "ETAPA",
  },
  {
    tag: "Filiações Abertas",
    year: "2026",
    line1: "GARANTA",
    line2: "SUA VAGA",
    sub: "Atletas e Academias · Carteirinha Digital",
    benefits: ["Acesso a todos os campeonatos oficiais", "Carteirinha digital com QR Code"],
    btns: [
      { label: "Quero me Filiar →", primary: true },
      { label: "Ver Benefícios", primary: false },
    ],
    wm1: "FILIE",
    wm2: "SE JÁ",
  },
]

export default function HeroDesktop() {
  const [active, setActive] = useState(0)
  const prev = () => setActive(i => (i - 1 + slides.length) % slides.length)
  const next = () => setActive(i => (i + 1) % slides.length)
  const s = slides[active]

  return (
    <section style={{ background: "#0A0A0A", padding: "80px 60px 72px", position: "relative", overflow: "hidden", minHeight: 320, display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: "#F0B90B" }} />

      {/* Watermark */}
      <div style={{ position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", lineHeight: 1, textAlign: "right" }}>
        <span style={{ display: "block", fontFamily: "'Bebas Neue', sans-serif", fontSize: 112, color: "#fff", opacity: 0.04, letterSpacing: 8 }}>{s.wm1}</span>
        <span style={{ display: "block", fontFamily: "'Bebas Neue', sans-serif", fontSize: 112, color: "#F0B90B", opacity: 0.05, letterSpacing: 8 }}>{s.wm2}</span>
      </div>

      {/* Prev */}
      <div onClick={prev} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, background: "rgba(255,255,255,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 3 }}>‹</div>

      {/* Next */}
      <div onClick={next} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, background: "rgba(255,255,255,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 3 }}>›</div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, paddingLeft: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 1, background: "#F0B90B" }} />
          <span style={{ color: "#F0B90B", fontSize: 13, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>{s.tag}</span>
        </div>

        {s.badge && (
          <div style={{ marginBottom: 14 }}>
            <span style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 11, fontWeight: 800, padding: "3px 12px", borderRadius: 3, letterSpacing: 2, textTransform: "uppercase" }}>{s.badge}</span>
          </div>
        )}

        <div style={{ color: "#F0B90B", fontSize: 15, fontWeight: 800, letterSpacing: 6, textTransform: "uppercase", marginBottom: 4 }}>{s.year}</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 102, color: "#fff", lineHeight: 0.88, letterSpacing: 3, marginBottom: 10 }}>
          {s.line1}<br /><span style={{ color: "#F0B90B" }}>{s.line2}</span>
        </h1>
        <p style={{ color: "#555", fontSize: 13, letterSpacing: 4, textTransform: "uppercase", marginBottom: s.benefits ? 16 : 32 }}>
          {s.sub}
        </p>

        {s.benefits && (
          <div style={{ marginBottom: 28 }}>
            {s.benefits.map((b, i) => (
              <div key={i} style={{ color: "#666", fontSize: 13, letterSpacing: 2, marginBottom: 6 }}>· {b}</div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 14 }}>
          {s.btns.map((btn, i) => (
            <button key={i} style={btn.primary
              ? { background: "#F0B90B", color: "#0A0A0A", fontSize: 13, fontWeight: 800, padding: "14px 28px", borderRadius: 5, letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: "pointer" }
              : { border: "1px solid #444", color: "#999", fontSize: 13, fontWeight: 600, padding: "14px 28px", borderRadius: 5, letterSpacing: 2, textTransform: "uppercase", background: "none", cursor: "pointer" }
            }>{btn.label}</button>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 8 }}>
        {slides.map((_, i) => (
          <div key={i} onClick={() => setActive(i)} style={{
            width: i === active ? 42 : 13,
            height: 13,
            background: i === active ? "#F0B90B" : "rgba(255,255,255,0.3)",
            borderRadius: i === active ? 7 : "50%",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>
    </section>
  )
}
