import noticia1 from "../../../assets/image/noticia1.jpeg"
import noticia2 from "../../../assets/image/noticia2.jpeg"
import noticia3 from "../../../assets/image/noticia3.jpg"

const news = [
  { title: "Campeonato mineiro de jiu jitsu 23 de maio", cat: "Destaque", img: noticia1 },
  { title: "Campeões de Aperibe em Minas",               cat: "Destaque", img: noticia2 },
  { title: "Ranking 2026 atualizado",                    cat: "Ranking",  img: noticia3 },
]

export default function NewsSectionMobile() {
  return (
    <section style={{ padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 18, height: 2, background: "#F0B90B", borderRadius: 1 }} />
        <span style={{ color: "#F0B90B", fontSize: 9, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Blog</span>
      </div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 33, color: "#0A0A0A", letterSpacing: 1, marginBottom: 20 }}>Últimas Notícias</h2>
      {news.map((n, i) => (
        <div key={i} style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ height: 100, position: "relative", overflow: "hidden" }}>
            <img src={n.img} alt={n.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
            <span style={{ position: "absolute", bottom: 10, left: 10, background: "#F0B90B", color: "#0A0A0A", fontSize: 8, fontWeight: 800, padding: "2px 8px", borderRadius: 3, letterSpacing: 1.5 }}>{n.cat}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A", lineHeight: 1.5, padding: 12 }}>{n.title}</div>
        </div>
      ))}
    </section>
  )
}
