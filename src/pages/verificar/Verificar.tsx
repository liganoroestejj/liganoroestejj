import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { getPublicCard, type PublicCard } from "../../lib/affiliates"
import { effectiveStatus } from "../../lib/affiliateOptions"
import Carteirinha from "../../components/Carteirinha"

const STATUS: Record<string, { text: string; color: string }> = {
  active: { text: "Filiação ativa", color: "#22c55e" },
  pending: { text: "Pagamento pendente", color: "#F0B90B" },
  overdue: { text: "Em atraso", color: "#ef4444" },
}

export default function Verificar() {
  const { cardId } = useParams<{ cardId: string }>()
  const [card, setCard] = useState<PublicCard | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    ;(async () => {
      if (cardId) setCard(await getPublicCard(cardId))
      setCarregando(false)
    })()
  }, [cardId])

  const st = card ? STATUS[effectiveStatus(card.status, card.validUntil)] ?? STATUS.pending : null

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 28 }}>
        <svg width="16" height="22" viewBox="0 0 14 22" fill="none"><path d="M9 0L2 12h5l-2 10 9-13H9L11 0z" fill="#F0B90B" /></svg>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#fff", letterSpacing: 3 }}>LNJJP</span>
      </Link>

      {carregando ? (
        <p style={{ color: "#666", fontSize: 14 }}>Verificando carteirinha...</p>
      ) : card ? (
        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Selo de autenticidade */}
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 10, padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div>
              <div style={{ color: "#22c55e", fontSize: 14, fontWeight: 800, letterSpacing: 0.5 }}>Carteirinha autêntica</div>
              <div style={{ color: "#888", fontSize: 12 }}>Registro oficial da Liga Noroeste.</div>
            </div>
          </div>

          {/* Situação */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111", border: "1px solid #222", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
            <span style={{ color: "#888", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>Situação</span>
            <span style={{ color: st!.color, fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>● {st!.text}</span>
          </div>

          <Carteirinha
            data={{
              fullName: card.fullName,
              photoURL: card.photoURL,
              belt: card.belt,
              academyId: card.academyId,
              cpf: card.cpf,
              birthDate: card.birthDate,
              validUntil: card.validUntil,
              cardId: cardId!,
            }}
          />
        </div>
      ) : (
        <div style={{ maxWidth: 360, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Carteirinha não encontrada</div>
          <p style={{ color: "#888", fontSize: 14 }}>Este QR Code não corresponde a nenhuma filiação válida da Liga Noroeste.</p>
        </div>
      )}
    </div>
  )
}
