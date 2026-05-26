import noticia1 from "../../../assets/image/noticia1.jpeg"
import noticia2 from "../../../assets/image/noticia2.jpeg"
import noticia3 from "../../../assets/image/noticia3.jpg"

const news = [
  { title: "Campeonato mineiro de jiu jitsu 23 de maio", date: "23 de Maio, 2026", img: noticia1 },
  { title: "Campeões de Aperibe em Minas",               date: "",                img: noticia2 },
  { title: "Ranking 2026 atualizado",                    date: "",                img: noticia3 },
]

export default function NewsSectionDesktop() {
  return (
    <section style={{ padding: "64px 60px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 24, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 12, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>Blog</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 46, color: "#0A0A0A", letterSpacing: 1, lineHeight: 1, marginBottom: 32 }}>Últimas Notícias</h2>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #eee" }}>
          <div style={{ height: 180, position: "relative", overflow: "hidden" }}>
            <img src={news[0].img} alt={news[0].title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
            <span style={{ position: "absolute", bottom: 14, left: 14, background: "#F0B90B", color: "#0A0A0A", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 3, letterSpacing: 1.5, textTransform: "uppercase" }}>Destaque</span>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A", lineHeight: 1.5, marginBottom: 6 }}>{news[0].title}</div>
            <div style={{ fontSize: 13, color: "#222" }}>{news[0].date}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {news.slice(1).map((n, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #eee" }}>
              <div style={{ height: 100, position: "relative", overflow: "hidden" }}>
                <img src={n.img} alt={n.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A", lineHeight: 1.5 }}>{n.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
