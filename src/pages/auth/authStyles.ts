import type { CSSProperties } from "react"

export const page: CSSProperties = {
  minHeight: "100vh",
  background: "#0A0A0A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
}

export const card: CSSProperties = {
  width: "100%",
  maxWidth: 400,
  background: "#111",
  border: "1px solid #222",
  borderLeft: "4px solid #F0B90B",
  borderRadius: 8,
  padding: "40px 32px",
}

export const title: CSSProperties = {
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: 38,
  color: "#fff",
  letterSpacing: 3,
  lineHeight: 1,
  margin: 0,
}

export const subtitle: CSSProperties = {
  color: "#F0B90B",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 3,
  textTransform: "uppercase",
  marginTop: 6,
  marginBottom: 28,
}

export const label: CSSProperties = {
  display: "block",
  color: "#999",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 2,
  textTransform: "uppercase",
  marginBottom: 6,
}

export const input: CSSProperties = {
  width: "100%",
  background: "#0A0A0A",
  border: "1px solid #333",
  borderRadius: 5,
  color: "#fff",
  fontSize: 15,
  padding: "12px 14px",
  marginBottom: 18,
  outline: "none",
  boxSizing: "border-box",
}

export const select: CSSProperties = {
  ...input,
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1.5L6 6.5L11 1.5' stroke='%23F0B90B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: 38,
}

export const button: CSSProperties = {
  width: "100%",
  background: "#F0B90B",
  color: "#0A0A0A",
  fontSize: 14,
  fontWeight: 800,
  padding: "14px",
  borderRadius: 5,
  letterSpacing: 2,
  textTransform: "uppercase",
  border: "none",
  cursor: "pointer",
}

export const error: CSSProperties = {
  background: "rgba(220,38,38,0.1)",
  border: "1px solid rgba(220,38,38,0.4)",
  color: "#f87171",
  fontSize: 13,
  padding: "10px 12px",
  borderRadius: 5,
  marginBottom: 18,
}

export const footerLink: CSSProperties = {
  color: "#999",
  fontSize: 13,
  textAlign: "center",
  marginTop: 22,
}
