const BoltIcon = () => (
  <svg width="12" height="16" viewBox="0 0 14 22" fill="none">
    <path d="M9 0L2 12h5l-2 10 9-13H9L11 0z" fill="#F0B90B" />
  </svg>
)

const links = ["Calendário", "Ranking", "Filiação", "Contato"]

export default function FooterMobile() {
  return (
    <footer style={{ background: "#0A0A0A", padding: 24, textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
        <BoltIcon />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, color: "#fff", letterSpacing: 4 }}>LNJJP</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 14 }}>
        {links.map(l => <a key={l} href="#" style={{ color: "#F0B90B", fontSize: 11, textDecoration: "none" }}>{l}</a>)}
      </div>
      <div style={{ color: "#F0B90B", fontSize: 10, letterSpacing: 1.5 }}>© {new Date().getFullYear()} Liga Noroeste Jiu-Jitsu</div>
    </footer>
  )
}
