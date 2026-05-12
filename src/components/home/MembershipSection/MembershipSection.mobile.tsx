const benefits = [
  "Acesso a todos os campeonatos oficiais",
  "Carteirinha digital com QR Code",
  "Válido para atletas e academias",
]

export default function MembershipSectionMobile() {
  return (
    <section style={{ padding: "0 24px 28px" }}>
      <div style={{ background: "#0A0A0A", borderRadius: 10, padding: 24 }}>
        <div style={{ border: "1px solid #F0B90B", color: "#F0B90B", fontSize: 8, fontWeight: 700, letterSpacing: 3, padding: "3px 10px", display: "inline-block", marginBottom: 14 }}>Filiações Abertas</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#fff", lineHeight: 1, marginBottom: 14 }}>
          Garanta sua <span style={{ color: "#F0B90B" }}>Carteirinha</span>
        </h2>
        {benefits.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 16, height: 16, background: "#F0B90B", borderRadius: "50%", flexShrink: 0, marginTop: 2 }} />
            <span style={{ color: "#aaa", fontSize: 11, lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
        <button style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 12, fontWeight: 800, padding: 14, borderRadius: 6, display: "block", width: "100%", marginTop: 16, letterSpacing: 1.5, textTransform: "uppercase", border: "none", cursor: "pointer" }}>
          Quero me Filiar →
        </button>
      </div>
    </section>
  )
}
