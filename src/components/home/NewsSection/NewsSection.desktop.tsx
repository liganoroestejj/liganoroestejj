const news = [
  { title: "1ª Etapa reúne mais de 200 atletas em Itaperuna e define líderes do ranking", date: "15 de Março, 2025", main: true,  bg: "#111" },
  { title: "Liga anuncia parceria com academias da região Noroeste",                        date: "",               main: false, bg: "#1a1a1a" },
  { title: "Ranking 2025 atualizado após a 2ª etapa",                                       date: "",               main: false, bg: "#0d0d0d" },
]

export default function NewsSectionDesktop() {
  return (
    <section style={{ padding: "64px 60px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 24, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 10, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>Blog</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#0A0A0A", letterSpacing: 1, lineHeight: 1, marginBottom: 32 }}>Últimas Notícias</h2>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #eee" }}>
          <div style={{ height: 180, background: news[0].bg, display: "flex", alignItems: "flex-end", padding: 14 }}>
            <span style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 3, letterSpacing: 1.5, textTransform: "uppercase" }}>Destaque</span>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0A", lineHeight: 1.5, marginBottom: 6 }}>{news[0].title}</div>
            <div style={{ fontSize: 11, color: "#aaa" }}>{news[0].date}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {news.slice(1).map((n, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #eee" }}>
              <div style={{ height: 100, background: n.bg }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0A", lineHeight: 1.5 }}>{n.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
