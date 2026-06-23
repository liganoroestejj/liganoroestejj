import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { confirmPayment, listAffiliates, type AdminAffiliate } from "../../lib/affiliates"
import { ACADEMIES, BELT_LABELS, effectiveStatus, ROLE_LABELS } from "../../lib/affiliateOptions"

const academyName = (id: number) => ACADEMIES.find((a) => a.id === id)?.name ?? "—"

const STATUS: Record<string, { text: string; color: string; bg: string }> = {
  pending: { text: "Pendente", color: "#F0B90B", bg: "rgba(240,185,11,0.12)" },
  active: { text: "Ativo", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  overdue: { text: "Em atraso", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
}

function currentMonth(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`
}

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

/** "2026-06" -> "Junho/2026" */
function monthLabel(ym: string): string {
  const [y, m] = ym.split("-")
  return `${MESES[Number(m) - 1]}/${y}`
}

function formatDate(iso?: string): string {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  return d ? `${d}/${m}/${y}` : iso
}

function formatTs(ts?: { seconds: number } | null): string {
  if (!ts) return "—"
  return new Date(ts.seconds * 1000).toLocaleDateString("pt-BR")
}

const th: React.CSSProperties = { textAlign: "left", color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "0 14px 12px", whiteSpace: "nowrap" }
const td: React.CSSProperties = { padding: "12px 14px", borderTop: "1px solid #1c1c1c", fontSize: 13, color: "#ddd", whiteSpace: "nowrap" }

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState<AdminAffiliate[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<AdminAffiliate | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setRows(await listAffiliates())
      } catch {
        setErro("Não foi possível carregar os filiados.")
      } finally {
        setCarregando(false)
      }
    })()
  }, [])

  async function handleLogout() {
    await logout()
    navigate("/", { replace: true })
  }

  async function marcarPago(a: AdminAffiliate) {
    if (!user) return
    setAlvo(null)
    setConfirmando(a.cpf)
    try {
      const { validUntil } = await confirmPayment({
        cpf: a.cpf,
        month: currentMonth(),
        adminUid: user.uid,
        affiliate: { uid: a.uid, fullName: a.fullName, academyId: a.academyId, belt: a.belt, photoURL: a.photoURL, cardId: a.cardId },
      })
      setRows((rs) => rs.map((r) => r.cpf === a.cpf
        ? { ...r, status: "active", validUntil, lastPaymentAt: { seconds: Date.now() / 1000 } }
        : r))
    } catch {
      setErro(`Falha ao confirmar pagamento de ${a.fullName}.`)
    } finally {
      setConfirmando(null)
    }
  }

  const ativos = rows.filter((r) => effectiveStatus(r.status, r.validUntil) === "active").length
  const pendentes = rows.length - ativos

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", padding: "48px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <div style={{ color: "#F0B90B", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
              Painel Administrativo
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#fff", letterSpacing: 2, margin: 0 }}>
              Filiados
            </h1>
            <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
              {rows.length} filiados · <span style={{ color: "#22c55e" }}>{ativos} ativos</span> · <span style={{ color: "#F0B90B" }}>{pendentes} pendentes</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/" style={{ border: "1px solid #333", color: "#999", fontSize: 12, fontWeight: 700, padding: "10px 16px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>Ver site</Link>
            <button onClick={handleLogout} style={{ border: "1px solid #444", color: "#999", fontSize: 12, fontWeight: 700, padding: "10px 16px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", background: "none", cursor: "pointer" }}>Sair</button>
          </div>
        </div>

        {erro && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 18 }}>{erro}</div>}

        {carregando ? (
          <p style={{ color: "#666", fontSize: 14 }}>Carregando filiados...</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14 }}>Nenhum filiado ainda.</p>
        ) : (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr>
                  <th style={{ ...th, paddingLeft: 18 }}>Atleta</th>
                  <th style={th}>Academia</th>
                  <th style={th}>Faixa</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Status</th>
                  <th style={th}>Últ. pagamento</th>
                  <th style={th}>Validade</th>
                  <th style={{ ...th, textAlign: "right", paddingRight: 18 }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const s = STATUS[effectiveStatus(a.status, a.validUntil)] ?? STATUS.pending
                  return (
                    <tr key={a.cpf}>
                      <td style={{ ...td, paddingLeft: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: "#0A0A0A", border: "1px solid #333", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {a.photoURL ? <img src={a.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                          </div>
                          <div>
                            <div style={{ color: "#fff", fontWeight: 700 }}>{a.fullName}</div>
                            <div style={{ color: "#666", fontSize: 11 }}>{a.cpf}</div>
                          </div>
                        </div>
                      </td>
                      <td style={td}>{academyName(a.academyId)}</td>
                      <td style={td}>{BELT_LABELS[a.belt] ?? "—"}</td>
                      <td style={td}>{ROLE_LABELS[a.role] ?? "—"}</td>
                      <td style={td}><span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.text}</span></td>
                      <td style={td}>{formatTs(a.lastPaymentAt)}</td>
                      <td style={td}>{formatDate(a.validUntil)}</td>
                      <td style={{ ...td, textAlign: "right", paddingRight: 18 }}>
                        <button
                          onClick={() => setAlvo(a)}
                          disabled={confirmando === a.cpf}
                          style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 11, fontWeight: 800, padding: "8px 14px", borderRadius: 5, letterSpacing: 0.5, textTransform: "uppercase", border: "none", cursor: "pointer", opacity: confirmando === a.cpf ? 0.6 : 1 }}
                        >
                          {confirmando === a.cpf ? "..." : "Marcar pago"}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmação de pagamento */}
      {alvo && (
        <div
          onClick={() => setAlvo(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 400, background: "#141414", border: "1px solid #2a2a2a", borderLeft: "4px solid #F0B90B", borderRadius: 10, padding: "28px 24px" }}
          >
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#fff", letterSpacing: 1, margin: "0 0 8px" }}>
              Confirmar pagamento
            </h2>
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.5, margin: "0 0 22px" }}>
              Confirmar o pagamento de <strong style={{ color: "#fff" }}>{alvo.fullName}</strong> referente a <strong style={{ color: "#F0B90B" }}>{monthLabel(currentMonth())}</strong>?
              <br />A filiação será ativada e a carteirinha liberada (validade +1 mês).
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => marcarPago(alvo)}
                style={{ flex: 1, minWidth: 120, background: "#F0B90B", color: "#0A0A0A", fontSize: 13, fontWeight: 800, padding: "13px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer" }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setAlvo(null)}
                style={{ flex: 1, minWidth: 120, background: "none", color: "#999", fontSize: 13, fontWeight: 700, padding: "13px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase", border: "1px solid #444", cursor: "pointer" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
