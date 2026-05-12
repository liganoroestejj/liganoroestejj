const news = [
  { title: "1ª Etapa reúne mais de 200 atletas em Itaperuna", cat: "Destaque", bg: "#111" },
  { title: "Ranking 2025 atualizado após a 2ª etapa",          cat: "Ranking",  bg: "#0d0d0d" },
]

export default function NewsSectionMobile() {
  return (
    <section style={{ padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 18, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 8, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Blog</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#0A0A0A", letterSpacing: 1, marginBottom: 20 }}>Últimas Notícias</h2>
      {news.map((n, i) => (
        <div key={i} style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ height: 100, background: n.bg, display: "flex", alignItems: "flex-end", padding: 10 }}>
            <span style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 7, fontWeight: 800, padding: "2px 8px", borderRadius: 3, letterSpacing: 1.5 }}>{n.cat}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0A0A0A", lineHeight: 1.5, padding: 12 }}>{n.title}</div>
        </div>
      ))}
    </section>
  )
}
