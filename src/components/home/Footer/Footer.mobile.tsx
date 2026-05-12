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
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#fff", letterSpacing: 4 }}>LNJJP</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 14 }}>
        {links.map(l => <a key={l} href="#" style={{ color: "#D4A800", fontSize: 10, textDecoration: "none" }}>{l}</a>)}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 34, height: 34, border: "1px solid #333", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.178 3.178 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" fill="#F0B90B"/>
          </svg>
        </div>
        <div style={{ width: 34, height: 34, border: "1px solid #333", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" width="14" height="14">
            <rect x="2" y="2" width="20" height="20" rx="5" fill="#F0B90B"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="#0A0A0A"/>
          </svg>
        </div>
      </div>
      <div style={{ color: "#A07800", fontSize: 9, letterSpacing: 1.5 }}>© {new Date().getFullYear()} Liga Noroeste Jiu-Jitsu</div>
    </footer>
  )
}
