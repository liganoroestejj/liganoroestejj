export default function HeroMobile() {
  return (
    <section style={{ background: "#0A0A0A", position: "relative", overflow: "hidden", minHeight: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#F0B90B" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <svg width="320" height="320" viewBox="0 0 100 100" fill="none" style={{ opacity: 0.06 }}>
          <polygon points="60,5 38,45 55,45 35,95 82,45 60,45 85,5" fill="#F0B90B" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>‹</div>
      <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>›</div>
      <div style={{ textAlign: "center", position: "relative", zIndex: 2, padding: "0 48px", width: "100%" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 20, height: 1, background: "#F0B90B" }} />
          <span style={{ color: "#F0B90B", fontSize: 9, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Federação Up Regional</span>
          <div style={{ width: 20, height: 1, background: "#F0B90B" }} />
        </div>
        <div style={{ color: "#F0B90B", fontSize: 13, fontWeight: 800, letterSpacing: 6, textTransform: "uppercase", marginBottom: 4 }}>2025</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: "#fff", lineHeight: 1, letterSpacing: 3 }}>
          LIGA<br /><span style={{ color: "#F0B90B" }}>NOROESTE</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", margin: "8px 0 24px" }}>
          Jiu Jitsu Pro
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 12, fontWeight: 800, padding: 14, borderRadius: 6, letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: "pointer" }}>
            Fazer Filiação
          </button>
          <button style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, padding: 14, borderRadius: 6, letterSpacing: 1.5, background: "none", cursor: "pointer" }}>
            Ver Calendário
          </button>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
        <div style={{ width: 20, height: 7, background: "#F0B90B", borderRadius: 4 }} />
        <div style={{ width: 7, height: 7, background: "rgba(255,255,255,0.3)", borderRadius: "50%" }} />
        <div style={{ width: 7, height: 7, background: "rgba(255,255,255,0.3)", borderRadius: "50%" }} />
      </div>
    </section>
  )
}
