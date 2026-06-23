import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface Slide {
  tag: string
  year: string
  line1: string
  line2: string
  sub: string
  badge?: string
  benefits?: string[]
  btns: { label: string; primary: boolean; to: string }[]
}

const slides: Slide[] = [
  {
    tag: "Federação Regional",
    year: "2026",
    line1: "LIGA",
    line2: "NOROESTE",
    sub: "Jiu Jitsu Pro",
    btns: [
      { label: "Fazer Filiação", primary: true, to: "/cadastro" },
      { label: "Ver Calendário", primary: false, to: "/calendario" },
    ],
  },
  {
    tag: "Próxima Etapa",
    year: "24 Mai",
    line1: "1ª ETAPA",
    line2: "ITAPERUNA",
    sub: "📍 Itaperuna — RJ",
    badge: "Inscrições Abertas",
    btns: [
      { label: "Ver Inscrições", primary: true, to: "/calendario" },
      { label: "Ver Calendário", primary: false, to: "/calendario" },
    ],
  },
  {
    tag: "Filiações Abertas",
    year: "2026",
    line1: "GARANTA",
    line2: "SUA VAGA",
    sub: "Atletas e Academias",
    benefits: ["Acesso a todos os campeonatos", "Carteirinha digital com QR Code"],
    btns: [
      { label: "Quero me Filiar →", primary: true, to: "/cadastro" },
    ],
  },
]

export default function HeroMobile() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const prev = () => setActive(i => (i - 1 + slides.length) % slides.length)
  const next = () => setActive(i => (i + 1) % slides.length)
  const s = slides[active]

  return (
    <section style={{ background: "#0A0A0A", position: "relative", overflow: "hidden", minHeight: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#F0B90B" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <svg width="320" height="320" viewBox="0 0 100 100" fill="none" style={{ opacity: 0.06 }}>
          <polygon points="60,5 38,45 55,45 35,95 82,45 60,45 85,5" fill="#F0B90B" />
        </svg>
      </div>

      <div onClick={prev} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 17, cursor: "pointer", zIndex: 3 }}>‹</div>
      <div onClick={next} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 17, cursor: "pointer", zIndex: 3 }}>›</div>

      <div style={{ textAlign: "center", position: "relative", zIndex: 2, padding: "0 48px", width: "100%" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 20, height: 1, background: "#F0B90B" }} />
          <span style={{ color: "#F0B90B", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>{s.tag}</span>
          <div style={{ width: 20, height: 1, background: "#F0B90B" }} />
        </div>

        {s.badge && (
          <div style={{ marginBottom: 8 }}>
            <span style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 3, letterSpacing: 2, textTransform: "uppercase" }}>{s.badge}</span>
          </div>
        )}

        <div style={{ color: "#F0B90B", fontSize: 14, fontWeight: 800, letterSpacing: 6, textTransform: "uppercase", marginBottom: 4 }}>{s.year}</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 53, color: "#fff", lineHeight: 1, letterSpacing: 3 }}>
          {s.line1}<br /><span style={{ color: "#F0B90B" }}>{s.line2}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", margin: "8px 0 16px" }}>
          {s.sub}
        </p>

        {s.benefits && (
          <div style={{ marginBottom: 16 }}>
            {s.benefits.map((b, i) => (
              <div key={i} style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 2, marginBottom: 5 }}>· {b}</div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {s.btns.map((btn, i) => (
            <button key={i} onClick={() => navigate(btn.to)} style={btn.primary
              ? { background: "#F0B90B", color: "#0A0A0A", fontSize: 13, fontWeight: 800, padding: 14, borderRadius: 6, letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: "pointer" }
              : { border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, padding: 14, borderRadius: 6, letterSpacing: 1.5, background: "none", cursor: "pointer" }
            }>{btn.label}</button>
          ))}
        </div>
      </div>

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
