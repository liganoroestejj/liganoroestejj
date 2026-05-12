export default function HeroDesktop() {
  return (
    <section style={{ background: "#0A0A0A", padding: "80px 60px 72px", position: "relative", overflow: "hidden", minHeight: 320, display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: "#F0B90B" }} />
      <div style={{ position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", lineHeight: 1, textAlign: "right" }}>
        <span style={{ display: "block", fontFamily: "'Bebas Neue', sans-serif", fontSize: 110, color: "#fff", opacity: 0.04, letterSpacing: 8 }}>LIGA</span>
        <span style={{ display: "block", fontFamily: "'Bebas Neue', sans-serif", fontSize: 110, color: "#F0B90B", opacity: 0.05, letterSpacing: 8 }}>NOROESTE</span>
      </div>
      <div style={{ position: "relative", zIndex: 2, paddingLeft: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 1, background: "#F0B90B" }} />
          <span style={{ color: "#F0B90B", fontSize: 11, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>Federação Up Regional</span>
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 100, color: "#fff", lineHeight: 0.88, letterSpacing: 3, marginBottom: 10 }}>
          LIGA<br /><span style={{ color: "#F0B90B" }}>NOROESTE</span>
        </h1>
        <p style={{ color: "#555", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 32 }}>
          Jiu Jitsu Pro · Região Noroeste Fluminense
        </p>
        <div style={{ display: "flex", gap: 14 }}>
          <button style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 11, fontWeight: 800, padding: "14px 28px", borderRadius: 5, letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: "pointer" }}>
            Fazer Filiação
          </button>
          <button style={{ border: "1px solid #444", color: "#999", fontSize: 11, fontWeight: 600, padding: "14px 28px", borderRadius: 5, letterSpacing: 2, textTransform: "uppercase", background: "none", cursor: "pointer" }}>
            Ver Calendário
          </button>
        </div>
      </div>
    </section>
  )
}
