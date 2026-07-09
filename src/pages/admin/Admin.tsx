import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { adminSoftDelete, confirmPayment, listAffiliates, type AdminAffiliate } from "../../lib/affiliates"
import { ACADEMIES, BELT_LABELS, effectiveStatus, ROLE_LABELS } from "../../lib/affiliateOptions"

const academyName = (id: number) => ACADEMIES.find((a) => a.id === id)?.name ?? "—"

const STATUS: Record<string, { text: string; color: string; bg: string }> = {
  pending: { text: "Pendente", color: "#F0B90B", bg: "rgba(240,185,11,0.12)" },
  active: { text: "Ativo", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  overdue: { text: "Em atraso", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  inactive: { text: "Removido", color: "#888", bg: "rgba(136,136,136,0.12)" },
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

type StatusFiltro = "all" | "active" | "pending" | "inactive"
type AbaFiltro = "all" | number // number = role id
type SortKey = "validUntil" | "lastPaymentAt" | null

// Pluraliza rótulos em português (NEW-03): "Professor" -> "Professores",
// "Atleta" -> "Atletas". Palavras terminadas em "r" recebem "es".
function pluralize(label: string): string {
  return /r$/i.test(label) ? `${label}es` : `${label}s`
}

// Abas por tipo de usuário (BUG-20). Deriva dos rótulos de role.
const ABAS: { key: AbaFiltro; label: string }[] = [
  { key: "all", label: "Todos" },
  ...Object.entries(ROLE_LABELS).map(([id, label]) => ({ key: Number(id), label: pluralize(label) })),
]

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState<AdminAffiliate[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [alvoPagar, setAlvoPagar] = useState<AdminAffiliate | null>(null)
  const [alvoRemover, setAlvoRemover] = useState<AdminAffiliate | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [menuAberto, setMenuAberto] = useState<string | null>(null)

  // Filtros / busca / ordenação
  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState<StatusFiltro>("all")
  const [aba, setAba] = useState<AbaFiltro>("all")
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

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
    setAlvoPagar(null)
    setConfirmando(a.cpf)
    try {
      const { validUntil } = await confirmPayment({
        cpf: a.cpf,
        month: currentMonth(),
        adminUid: user.uid,
        affiliate: { uid: a.uid, fullName: a.fullName, academyId: a.academyId, belt: a.belt, photoURL: a.photoURL, birthDate: a.birthDate, cardId: a.cardId },
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

  async function removerAtleta(a: AdminAffiliate) {
    setAlvoRemover(null)
    setRemovendo(a.cpf)
    try {
      await adminSoftDelete(a.cpf, a.cardId)
      setRows((rs) => rs.map((r) => r.cpf === a.cpf ? { ...r, status: "inactive" } : r))
    } catch {
      setErro(`Falha ao remover ${a.fullName}.`)
    } finally {
      setRemovendo(null)
    }
  }

  function toggleSort(key: Exclude<SortKey, null>) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const ativos = rows.filter((r) => effectiveStatus(r.status, r.validUntil) === "active").length
  const inativos = rows.filter((r) => effectiveStatus(r.status, r.validUntil) === "inactive").length
  const pendentes = rows.length - ativos - inativos

  const visiveis = useMemo(() => {
    let list = rows
    if (aba !== "all") list = list.filter((r) => r.role === aba)
    // BUG-07: removidos ficam ocultos por padrão; só aparecem no filtro "Removidos".
    if (filtro === "inactive") {
      list = list.filter((r) => effectiveStatus(r.status, r.validUntil) === "inactive")
    } else if (filtro === "active") {
      list = list.filter((r) => effectiveStatus(r.status, r.validUntil) === "active")
    } else if (filtro === "pending") {
      list = list.filter((r) => {
        const s = effectiveStatus(r.status, r.validUntil)
        return s !== "active" && s !== "inactive"
      })
    } else {
      // "all" exclui removidos (visíveis apenas via filtro específico).
      list = list.filter((r) => effectiveStatus(r.status, r.validUntil) !== "inactive")
    }
    const q = busca.trim().toLowerCase()
    if (q) {
      const digits = q.replace(/\D/g, "")
      list = list.filter((r) =>
        r.fullName.toLowerCase().includes(q) ||
        (!!digits && r.cpf.replace(/\D/g, "").includes(digits)) ||
        academyName(r.academyId).toLowerCase().includes(q),
      )
    }
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const av = sortKey === "validUntil" ? (a.validUntil ?? "") : (a.lastPaymentAt?.seconds ?? 0)
        const bv = sortKey === "validUntil" ? (b.validUntil ?? "") : (b.lastPaymentAt?.seconds ?? 0)
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return list
  }, [rows, aba, filtro, busca, sortKey, sortDir])

  const sortArrow = (key: Exclude<SortKey, null>) => (sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "")

  const resumoItem = (label: string, count: number, key: StatusFiltro, color: string): React.ReactNode => (
    <button
      onClick={() => setFiltro((f) => (f === key ? "all" : key))}
      style={{
        background: filtro === key ? "rgba(240,185,11,0.12)" : "none",
        border: filtro === key ? "1px solid rgba(240,185,11,0.5)" : "1px solid transparent",
        color, fontSize: 13, cursor: "pointer", padding: "2px 8px", borderRadius: 5, fontWeight: filtro === key ? 700 : 400,
      }}
    >
      {count} {label}
    </button>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", padding: "48px 24px" }} onClick={() => setMenuAberto(null)}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <div style={{ color: "#F0B90B", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
              Painel Administrativo
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#fff", letterSpacing: 2, margin: 0 }}>
              Filiados
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {resumoItem("filiados", rows.length, "all", "#888")}
              <span style={{ color: "#333" }}>·</span>
              {resumoItem("ativos", ativos, "active", "#22c55e")}
              <span style={{ color: "#333" }}>·</span>
              {resumoItem("pendentes", pendentes, "pending", "#F0B90B")}
              {inativos > 0 && (
                <>
                  <span style={{ color: "#333" }}>·</span>
                  {resumoItem("removidos", inativos, "inactive", "#888")}
                </>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/" style={{ border: "1px solid #333", color: "#999", fontSize: 12, fontWeight: 700, padding: "10px 16px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>Ver site</Link>
            <button onClick={handleLogout} style={{ border: "1px solid #444", color: "#999", fontSize: 12, fontWeight: 700, padding: "10px 16px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", background: "none", cursor: "pointer" }}>Sair</button>
          </div>
        </div>

        {/* Abas por tipo + busca */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ABAS.map((t) => (
              <button
                key={String(t.key)}
                onClick={() => setAba(t.key)}
                style={{
                  background: aba === t.key ? "#F0B90B" : "none",
                  color: aba === t.key ? "#0A0A0A" : "#999",
                  border: aba === t.key ? "none" : "1px solid #333",
                  fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 20, letterSpacing: 0.5, cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou academia..."
            style={{ background: "#111", border: "1px solid #2a2a2a", color: "#eee", fontSize: 13, padding: "10px 14px", borderRadius: 6, minWidth: 260, flex: "1 1 260px", maxWidth: 360, outline: "none" }}
          />
        </div>

        {erro && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 18 }}>{erro}</div>}

        {carregando ? (
          <p style={{ color: "#666", fontSize: 14 }}>Carregando filiados...</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14 }}>Nenhum filiado ainda.</p>
        ) : visiveis.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14 }}>Nenhum filiado encontrado para os filtros atuais.</p>
        ) : (
          <div className="dark-scroll" style={{ background: "#111", border: "1px solid #222", borderRadius: 10, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr>
                  <th style={{ ...th, paddingLeft: 18 }}>Atleta</th>
                  <th style={th}>Academia</th>
                  <th style={th}>Faixa</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("lastPaymentAt")}>Últ. pagamento{sortArrow("lastPaymentAt")}</th>
                  <th style={{ ...th, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("validUntil")}>Validade{sortArrow("validUntil")}</th>
                  <th style={{ ...th, textAlign: "right", paddingRight: 18 }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((a) => {
                  const eff = effectiveStatus(a.status, a.validUntil)
                  const s = STATUS[eff] ?? STATUS.pending
                  const isActive = eff === "active"
                  const isInactive = eff === "inactive"
                  return (
                    <tr key={a.cpf}>
                      <td style={{ ...td, paddingLeft: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: "#0A0A0A", border: "1px solid #333", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {a.photoURL ? <img src={a.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                          </div>
                          <div>
                            <div style={{ color: isInactive ? "#888" : "#fff", fontWeight: 700, textDecoration: isInactive ? "line-through" : "none" }}>{a.fullName}</div>
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
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, position: "relative" }}>
                          {isInactive ? (
                            <span style={{ color: "#666", fontSize: 11, fontStyle: "italic" }}>Removido</span>
                          ) : isActive ? (
                            // BUG-05: quando ativo, não é mais um botão clicável.
                            <span title={`Ativo até ${formatDate(a.validUntil)}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(34,197,94,0.12)", color: "#22c55e", fontSize: 11, fontWeight: 800, padding: "8px 12px", borderRadius: 5, letterSpacing: 0.5, textTransform: "uppercase" }}>
                              ✓ Pago
                            </span>
                          ) : (
                            <button
                              onClick={() => setAlvoPagar(a)}
                              disabled={confirmando === a.cpf}
                              style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 11, fontWeight: 800, padding: "8px 14px", borderRadius: 5, letterSpacing: 0.5, textTransform: "uppercase", border: "none", cursor: "pointer", opacity: confirmando === a.cpf ? 0.6 : 1 }}
                            >
                              {confirmando === a.cpf ? "..." : "Marcar pago"}
                            </button>
                          )}

                          {/* Menu de ações (M-01) */}
                          {!isInactive && (
                            <button
                              aria-label="Ações"
                              onClick={(e) => { e.stopPropagation(); setMenuAberto((m) => (m === a.cpf ? null : a.cpf)) }}
                              style={{ background: "none", border: "1px solid #333", color: "#999", width: 30, height: 30, borderRadius: 5, cursor: "pointer", fontSize: 16, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              ⋮
                            </button>
                          )}
                          {menuAberto === a.cpf && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, background: "#181818", border: "1px solid #2e2e2e", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", zIndex: 20, minWidth: 170, overflow: "hidden" }}
                            >
                              <button
                                onClick={() => { setMenuAberto(null); setAlvoRemover(a) }}
                                disabled={removendo === a.cpf}
                                style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: "#ef4444", fontSize: 13, fontWeight: 600, padding: "11px 14px", cursor: "pointer" }}
                              >
                                Remover atleta
                              </button>
                            </div>
                          )}
                        </div>
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
      {alvoPagar && (
        <div
          onClick={() => setAlvoPagar(null)}
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
              Confirmar o pagamento de <strong style={{ color: "#fff" }}>{alvoPagar.fullName}</strong> referente a <strong style={{ color: "#F0B90B" }}>{monthLabel(currentMonth())}</strong>?
              <br />A filiação será ativada e a carteirinha liberada (validade +1 mês).
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => marcarPago(alvoPagar)}
                style={{ flex: 1, minWidth: 120, background: "#F0B90B", color: "#0A0A0A", fontSize: 13, fontWeight: 800, padding: "13px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer" }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setAlvoPagar(null)}
                style={{ flex: 1, minWidth: 120, background: "none", color: "#999", fontSize: 13, fontWeight: 700, padding: "13px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase", border: "1px solid #444", cursor: "pointer" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de remoção (BUG-07) */}
      {alvoRemover && (
        <div
          onClick={() => setAlvoRemover(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 400, background: "#141414", border: "1px solid #2a2a2a", borderLeft: "4px solid #ef4444", borderRadius: 10, padding: "28px 24px" }}
          >
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#fff", letterSpacing: 1, margin: "0 0 8px" }}>
              Remover atleta
            </h2>
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.5, margin: "0 0 22px" }}>
              Remover <strong style={{ color: "#fff" }}>{alvoRemover.fullName}</strong> da lista de filiados?
              <br />O registro é <strong style={{ color: "#fff" }}>mantido</strong> (histórico preservado) e apenas marcado como inativo. A carteirinha será invalidada.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => removerAtleta(alvoRemover)}
                style={{ flex: 1, minWidth: 120, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 800, padding: "13px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer" }}
              >
                Remover
              </button>
              <button
                onClick={() => setAlvoRemover(null)}
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
