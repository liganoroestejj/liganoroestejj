const features = [
  { title: "Premiações",        desc: "Individual e por equipe em todas as etapas do circuito" },
  { title: "Ranking Anual",     desc: "Pontuação atualizada ao final de cada etapa" },
  { title: "Circuito Completo", desc: "8 etapas e eventos Opens ao longo do ano" },
]

const icons = [
  <svg key="a" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" width="26" height="26"><path d="M8 21l4-4 4 4M12 3v14M5 8l7-5 7 5"/></svg>,
  <svg key="b" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" width="26" height="26"><path d="M3 3h18M3 9h18M3 15h12M3 21h8"/></svg>,
  <svg key="c" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" width="26" height="26"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
]

export default function FeaturesSectionDesktop() {
  return (
    <section style={{ padding: "64px 60px", background: "#F9F9F7" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 24, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 10, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>Por que se filiar</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#0A0A0A", letterSpacing: 1, lineHeight: 1, marginBottom: 32 }}>Vantagens da Liga</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "#eee", borderRadius: 12, overflow: "hidden", border: "1px solid #eee" }}>
        {features.map((f, i) => (
          <div key={i} style={{ background: "#fff", padding: "32px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "#FBF6E8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{icons[i]}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0A0A0A", marginBottom: 7 }}>{f.title}</div>
            <div style={{ fontSize: 11, color: "#999", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
