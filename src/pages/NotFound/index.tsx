import { Link } from "react-router-dom"

const BoltIcon = () => (
  <svg width="34" height="52" viewBox="0 0 14 22" fill="none" aria-hidden="true">
    <path d="M9 0L2 12h5l-2 10 9-13H9L11 0z" fill="#F0B90B" />
  </svg>
)

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 24px",
        boxSizing: "border-box",
      }}
    >
      <BoltIcon />
      <h1
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(80px, 22vw, 160px)",
          color: "#fff",
          letterSpacing: 4,
          lineHeight: 1,
          margin: "16px 0 0",
        }}
      >
        404
      </h1>
      <div
        style={{
          color: "#F0B90B",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Página não encontrada
      </div>
      <p style={{ color: "#888", fontSize: 15, lineHeight: 1.6, maxWidth: 420, marginBottom: 32 }}>
        O endereço que você tentou acessar não existe ou foi movido. Verifique o
        link ou volte para a página inicial.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          to="/"
          style={{
            background: "#F0B90B",
            color: "#0A0A0A",
            fontSize: 13,
            fontWeight: 800,
            padding: "14px 28px",
            borderRadius: 5,
            letterSpacing: 2,
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Voltar ao início
        </Link>
        <Link
          to="/calendario"
          style={{
            border: "1px solid #444",
            color: "#999",
            fontSize: 13,
            fontWeight: 600,
            padding: "14px 28px",
            borderRadius: 5,
            letterSpacing: 2,
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Ver calendário
        </Link>
      </div>
    </div>
  )
}
