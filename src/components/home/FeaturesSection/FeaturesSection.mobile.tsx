const features = [
  { title: "Premiações",        desc: "Individual e por equipe em todas as etapas" },
  { title: "Ranking Anual",     desc: "Atualizado após cada etapa do circuito" },
  { title: "Circuito Completo", desc: "8 etapas + Opens ao longo do ano" },
]

const icons = [
  <svg key="a" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" width="22" height="22"><path d="M8 21l4-4 4 4M12 3v14M5 8l7-5 7 5"/></svg>,
  <svg key="b" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" width="22" height="22"><path d="M3 3h18M3 9h18M3 15h12"/></svg>,
  <svg key="c" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="2" width="22" height="22"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
]

export default function FeaturesSectionMobile() {
  return (
    <section style={{ padding: "32px 24px", background: "#F9F9F7" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 18, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 8, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Vantagens</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#0A0A0A", letterSpacing: 1, marginBottom: 20 }}>Por que se filiar</h2>
      {features.map((f, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: i < features.length - 1 ? "1px solid #eee" : "none" }}>
          <div style={{ width: 44, height: 44, background: "#FBF6E8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icons[i]}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0A0A0A", marginBottom: 3 }}>{f.title}</div>
            <div style={{ fontSize: 11, color: "#999", lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        </div>
      ))}
    </section>
  )
}
