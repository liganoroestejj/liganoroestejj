import { QRCodeSVG } from "qrcode.react"
import { ACADEMIES, BELT_LABELS } from "../lib/affiliateOptions"
import { formatCpf } from "../lib/cpf"

export interface CarteirinhaData {
  fullName: string
  photoURL?: string
  belt: number
  academyId: number
  cpf: string
  birthDate?: string
  validUntil?: string
  cardId: string
}

const academyName = (id: number) => ACADEMIES.find((a) => a.id === id)?.name ?? "—"

function formatDate(iso?: string): string {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  return d ? `${d}/${m}/${y}` : iso
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color: "#888", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: accent ? "#F0B90B" : "#fff", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
    </div>
  )
}

/** Carteirinha digital vertical, com QR Code de validação. */
export default function Carteirinha({ data }: { data: CarteirinhaData }) {
  const verifyUrl = `${window.location.origin}/verificar/${data.cardId}`

  return (
    <div style={{ width: "100%", maxWidth: 340, margin: "0 auto", background: "linear-gradient(160deg, #1a1a1a 0%, #0b0b0b 100%)", border: "1px solid #2a2a2a", borderRadius: 16, overflow: "hidden", boxShadow: "0 14px 36px rgba(0,0,0,0.45)" }}>
      {/* Cabeçalho */}
      <div style={{ background: "#F0B90B", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="20" viewBox="0 0 14 22" fill="none"><path d="M9 0L2 12h5l-2 10 9-13H9L11 0z" fill="#0A0A0A" /></svg>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#0A0A0A", letterSpacing: 2 }}>LNJJP</div>
        </div>
        <div style={{ color: "#0A0A0A", fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", textAlign: "right", lineHeight: 1.2 }}>
          Carteirinha<br />de Filiação
        </div>
      </div>

      {/* Foto + nome */}
      <div style={{ padding: "20px 18px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 120, height: 150, borderRadius: 10, background: "#0A0A0A", border: "2px solid #F0B90B", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {data.photoURL ? (
            <img src={data.photoURL} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          )}
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "#fff", letterSpacing: 1, lineHeight: 1.05, marginTop: 14, textAlign: "center" }}>{data.fullName}</div>
      </div>

      {/* Campos */}
      <div style={{ padding: "16px 22px 0", display: "flex", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row label="Academia" value={academyName(data.academyId)} />
          <Row label="Faixa" value={BELT_LABELS[data.belt] ?? "—"} accent />
          <Row label="Validade" value={formatDate(data.validUntil)} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row label="Nascimento" value={formatDate(data.birthDate)} />
          <Row label="Número" value={formatCpf(data.cpf)} />
        </div>
      </div>

      {/* QR Code de validação */}
      <div style={{ padding: "8px 22px 22px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 6, borderTop: "1px solid #222" }}>
        <div style={{ background: "#fff", padding: 6, borderRadius: 8, lineHeight: 0 }}>
          <QRCodeSVG value={verifyUrl} size={72} level="M" />
        </div>
        <div style={{ color: "#888", fontSize: 11, lineHeight: 1.4 }}>
          Aponte a câmera para<br />validar a autenticidade<br />desta carteirinha.
        </div>
      </div>
    </div>
  )
}
