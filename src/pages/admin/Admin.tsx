import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { adminRevertPayment, adminSoftDelete, confirmPayment, listAffiliates, type AdminAffiliate } from "../../lib/affiliates"
import { BELT_LABELS, effectiveStatus, ROLE_LABELS } from "../../lib/affiliateOptions"
import { addAcademy, removeAcademy, renameAcademy, type Academy } from "../../lib/academies"
import { useAcademies } from "../../hooks/useAcademies"
import { useMediaQuery } from "../../hooks/useMediaQuery"
import { formatCpf } from "../../lib/cpf"

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

/** Mês (yyyy-mm) em que um pagamento foi confirmado — é o id do doc em `payments`. */
function monthOfTs(ts?: { seconds: number } | null): string {
  if (!ts) return currentMonth()
  const d = new Date(ts.seconds * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
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

const th: React.CSSProperties = { textAlign: "left", color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "14px 16px", background: "#141414", borderBottom: "1px solid #242424", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
const td: React.CSSProperties = { padding: "16px 16px", borderTop: "1px solid #1c1c1c", fontSize: 13, color: "#ddd", whiteSpace: "nowrap", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" }

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

/** Compara nomes de academia ignorando acento e caixa. */
const normalizarNome = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const POR_PAGINA_OPCOES = [10, 15, 20, 25, 30]

/**
 * Páginas mostradas na barra. Até 7 cabem todas; acima disso vira uma janela
 * em volta da atual, com reticências, para a barra não crescer sem limite.
 */
function paginasVisiveis(atual: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (atual <= 4) return [1, 2, 3, 4, 5, "...", total]
  if (atual >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "...", atual - 1, atual, atual + 1, "...", total]
}

/** Barra de paginação — mesmo componente no desktop e no mobile. */
function Paginacao({ total, pagina, porPagina, isMobile, onPagina, onPorPagina }: {
  total: number
  pagina: number
  porPagina: number
  isMobile: boolean
  onPagina: (p: number) => void
  onPorPagina: (n: number) => void
}) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))
  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1
  const fim = Math.min(pagina * porPagina, total)
  // Nos extremos o botão fica sem ação: não navega e não responde ao clique.
  const semAnterior = pagina <= 1
  const semProxima = pagina >= totalPaginas

  const setaStyle = (inativo: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "none", border: "none", borderRadius: 5,
    color: inativo ? "#3d3d3d" : "#ccc",
    fontSize: 12, fontWeight: 700, padding: "8px 10px",
    cursor: inativo ? "default" : "pointer",
  })

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, marginTop: 18, flexWrap: "wrap",
      ...(isMobile
        ? { flexDirection: "column" as const }
        : { justifyContent: "space-between" }),
    }}>
      <span style={{ color: "#666", fontSize: 12 }}>
        Mostrando {inicio} a {fim} de {total} {total === 1 ? "filiado" : "filiados"}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <button
          type="button"
          onClick={() => { if (!semAnterior) onPagina(pagina - 1) }}
          disabled={semAnterior}
          aria-label="Página anterior"
          style={setaStyle(semAnterior)}
        >
          <span aria-hidden="true">‹</span> Anterior
        </button>

        {paginasVisiveis(pagina, totalPaginas).map((n, i) =>
          n === "..." ? (
            <span key={`gap-${i}`} style={{ color: "#444", fontSize: 12, padding: "0 4px" }}>...</span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPagina(n)}
              aria-label={`Página ${n}`}
              aria-current={n === pagina ? "page" : undefined}
              style={{
                minWidth: 30, height: 30, borderRadius: 5, border: "none",
                background: n === pagina ? "#F0B90B" : "none",
                color: n === pagina ? "#0A0A0A" : "#ccc",
                fontSize: 12, fontWeight: 800, cursor: "pointer", padding: "0 8px",
              }}
            >
              {n}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => { if (!semProxima) onPagina(pagina + 1) }}
          disabled={semProxima}
          aria-label="Próxima página"
          style={setaStyle(semProxima)}
        >
          Próxima <span aria-hidden="true">›</span>
        </button>
      </div>

      <select
        value={porPagina}
        onChange={(e) => onPorPagina(Number(e.target.value))}
        aria-label="Filiados por página"
        style={{ background: "#111", border: "1px solid #2a2a2a", color: "#eee", fontSize: 12, padding: "9px 12px", borderRadius: 6, outline: "none", cursor: "pointer" }}
      >
        {POR_PAGINA_OPCOES.map((n) => (
          <option key={n} value={n}>{n} por página</option>
        ))}
      </select>
    </div>
  )
}

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  // Breakpoint próprio da tela: abaixo disso as 8 colunas não cabem sem
  // espremer o botão de ação, então a lista vira cards.
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const [rows, setRows] = useState<AdminAffiliate[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [alvoPagar, setAlvoPagar] = useState<AdminAffiliate | null>(null)
  const [alvoRemover, setAlvoRemover] = useState<AdminAffiliate | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [alvoRemoverPagamento, setAlvoRemoverPagamento] = useState<AdminAffiliate | null>(null)
  const [removendoPagamento, setRemovendoPagamento] = useState<string | null>(null)
  const [menuAberto, setMenuAberto] = useState<{ cpf: string; top: number; right: number } | null>(null)

  // Academias (coleção `academies`) — usadas na lista e na seção de configurações.
  const { academies, carregando: carregandoAcademias, erro: erroAcademias, recarregar: recarregarAcademias } = useAcademies()
  const academyName = useCallback(
    (id: number) => academies.find((a) => a.id === id)?.name ?? "—",
    [academies],
  )

  // Configurações do cadastro → academias
  const [novaAcademia, setNovaAcademia] = useState("")
  const [salvandoAcademia, setSalvandoAcademia] = useState(false)
  const [erroAcademiaForm, setErroAcademiaForm] = useState("")
  const [alvoRemoverAcademia, setAlvoRemoverAcademia] = useState<Academy | null>(null)
  const [editandoAcademia, setEditandoAcademia] = useState<number | null>(null)
  const [nomeEditado, setNomeEditado] = useState("")
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [removendoAcademia, setRemovendoAcademia] = useState<number | null>(null)

  // Paginação
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)

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

  // O menu de ações é renderizado com position:fixed (fora do container que
  // rola), então precisa fechar se a página rolar ou mudar de tamanho.
  useEffect(() => {
    if (!menuAberto) return
    const fechar = () => setMenuAberto(null)
    window.addEventListener("scroll", fechar, true)
    window.addEventListener("resize", fechar)
    return () => {
      window.removeEventListener("scroll", fechar, true)
      window.removeEventListener("resize", fechar)
    }
  }, [menuAberto])

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
        affiliate: { uid: a.uid, fullName: a.fullName, academyId: a.academyId, belt: a.belt, photoURL: a.photoURL, birthDate: a.birthDate, cardId: a.cardId, validUntil: a.validUntil },
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

  async function removerPagamento(a: AdminAffiliate) {
    setAlvoRemoverPagamento(null)
    setRemovendoPagamento(a.cpf)
    try {
      await adminRevertPayment({ cpf: a.cpf, month: monthOfTs(a.lastPaymentAt), cardId: a.cardId })
      setRows((rs) => rs.map((r) => r.cpf === a.cpf
        ? { ...r, status: "pending", validUntil: undefined, lastPaymentAt: null }
        : r))
    } catch {
      setErro(`Falha ao remover o pagamento de ${a.fullName}.`)
    } finally {
      setRemovendoPagamento(null)
    }
  }

  async function adicionarAcademia(e: React.FormEvent) {
    e.preventDefault()
    const nome = novaAcademia.trim()
    if (!nome) return setErroAcademiaForm("Informe o nome da academia.")
    // Sem acento/caixa: evita "UP BJJ" e "up bjj" convivendo.
    if (academies.some((a) => normalizarNome(a.name) === normalizarNome(nome))) {
      return setErroAcademiaForm("Já existe uma academia com esse nome.")
    }
    setErroAcademiaForm("")
    setSalvandoAcademia(true)
    try {
      await addAcademy(nome)
      setNovaAcademia("")
      await recarregarAcademias()
    } catch {
      setErroAcademiaForm("Falha ao adicionar a academia.")
    } finally {
      setSalvandoAcademia(false)
    }
  }

  function iniciarEdicao(a: Academy) {
    setEditandoAcademia(a.id)
    setNomeEditado(a.name)
    setErroAcademiaForm("")
  }

  function cancelarEdicao() {
    setEditandoAcademia(null)
    setNomeEditado("")
    setErroAcademiaForm("")
  }

  async function salvarEdicao(a: Academy) {
    const nome = nomeEditado.trim()
    if (!nome) return setErroAcademiaForm("Informe o nome da academia.")
    if (nome === a.name) return cancelarEdicao()
    // O duplicado ignora a própria academia — renomear "up bjj" para "UP BJJ"
    // é só um ajuste de caixa, não uma colisão.
    const repetido = academies.some(
      (o) => o.id !== a.id && normalizarNome(o.name) === normalizarNome(nome),
    )
    if (repetido) return setErroAcademiaForm("Já existe uma academia com esse nome.")

    setErroAcademiaForm("")
    setSalvandoEdicao(true)
    try {
      await renameAcademy(a.id, nome)
      await recarregarAcademias()
      cancelarEdicao()
    } catch {
      setErroAcademiaForm(`Falha ao renomear ${a.name}.`)
    } finally {
      setSalvandoEdicao(false)
    }
  }

  async function excluirAcademia(a: Academy) {
    setAlvoRemoverAcademia(null)
    setRemovendoAcademia(a.id)
    try {
      await removeAcademy(a.id)
      await recarregarAcademias()
    } catch {
      setErroAcademiaForm(`Falha ao remover ${a.name}.`)
    } finally {
      setRemovendoAcademia(null)
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
  }, [rows, aba, filtro, busca, sortKey, sortDir, academyName])

  // Mudou filtro, busca, ordenação ou o tamanho da página: volta para a 1ª.
  // Sem isso o admin filtra e cai numa página vazia.
  useEffect(() => { setPagina(1) }, [aba, filtro, busca, sortKey, sortDir, porPagina])

  const totalPaginas = Math.max(1, Math.ceil(visiveis.length / porPagina))
  // Blinda contra página fora do intervalo (ex.: remover o último da lista).
  const paginaAtual = Math.min(pagina, totalPaginas)
  const paginados = useMemo(
    () => visiveis.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina),
    [visiveis, paginaAtual, porPagina],
  )

  const sortArrow = (key: Exclude<SortKey, null>) => (sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "")

  // Botões de ação de uma linha/card (mesmo comportamento em desktop e mobile).
  const acoes = (a: AdminAffiliate, largura?: boolean): React.ReactNode => {
    const eff = effectiveStatus(a.status, a.validUntil)
    if (eff === "inactive") return <span style={{ color: "#666", fontSize: 11, fontStyle: "italic" }}>Removido</span>
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: largura ? 1 : undefined }}>
        {eff === "active" ? (
          // BUG-05: quando ativo, não é mais um botão clicável.
          <span title={`Ativo até ${formatDate(a.validUntil)}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, flex: largura ? 1 : undefined, background: "rgba(34,197,94,0.12)", color: "#22c55e", fontSize: 11, fontWeight: 800, padding: "10px 12px", borderRadius: 5, letterSpacing: 0.5, textTransform: "uppercase" }}>
            ✓ Pago
          </span>
        ) : (
          <button
            onClick={() => setAlvoPagar(a)}
            disabled={confirmando === a.cpf}
            style={{ flex: largura ? 1 : undefined, background: "#F0B90B", color: "#0A0A0A", fontSize: 11, fontWeight: 800, padding: "10px 14px", borderRadius: 5, letterSpacing: 0.5, textTransform: "uppercase", border: "none", cursor: "pointer", opacity: confirmando === a.cpf ? 0.6 : 1 }}
          >
            {confirmando === a.cpf ? "..." : "Marcar pago"}
          </button>
        )}

        {/* Menu de ações (M-01) */}
        <button
          aria-label="Ações"
          onClick={(e) => {
            e.stopPropagation()
            const r = e.currentTarget.getBoundingClientRect()
            setMenuAberto((m) => (m?.cpf === a.cpf ? null : { cpf: a.cpf, top: r.bottom + 16, right: window.innerWidth - r.right }))
          }}
          style={{ background: "none", border: "1px solid #333", color: "#999", width: 34, height: 34, borderRadius: 6, cursor: "pointer", fontSize: 16, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          ⋮
        </button>
      </div>
    )
  }

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
    <div style={{ minHeight: "100vh", background: "#0A0A0A", padding: isMobile ? "32px 16px" : "48px 24px" }} onClick={() => setMenuAberto(null)}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
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
            style={{ background: "#111", border: "1px solid #2a2a2a", color: "#eee", fontSize: 13, padding: "12px 14px", borderRadius: 6, outline: "none", ...(isMobile ? { width: "100%" } : { minWidth: 260, flex: "1 1 260px", maxWidth: 360 }) }}
          />
        </div>

        {erro && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 18 }}>{erro}</div>}

        {carregando ? (
          <p style={{ color: "#666", fontSize: 14 }}>Carregando filiados...</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14 }}>Nenhum filiado ainda.</p>
        ) : visiveis.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14 }}>Nenhum filiado encontrado para os filtros atuais.</p>
        ) : isMobile ? (
          // No mobile a tabela não cabe: cada filiado vira um card.
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {paginados.map((a) => {
              const eff = effectiveStatus(a.status, a.validUntil)
              const s = STATUS[eff] ?? STATUS.pending
              const isInactive = eff === "inactive"
              const info = (label: string, valor: string) => (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                  <span style={{ color: "#666" }}>{label}</span>
                  <span style={{ color: "#ddd", textAlign: "right" }}>{valor}</span>
                </div>
              )
              return (
                <div key={a.cpf} style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: "#0A0A0A", border: "1px solid #333", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {a.photoURL ? <img src={a.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: isInactive ? "#888" : "#fff", fontWeight: 700, fontSize: 15, textDecoration: isInactive ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis" }}>{a.fullName}</div>
                      <div style={{ color: "#666", fontSize: 11 }}>{formatCpf(a.cpf)}</div>
                    </div>
                    <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 800, padding: "4px 9px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{s.text}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 14, borderTop: "1px solid #1c1c1c" }}>
                    {info("Academia", academyName(a.academyId))}
                    {info("Faixa", BELT_LABELS[a.belt] ?? "—")}
                    {info("Tipo", ROLE_LABELS[a.role] ?? "—")}
                    {info("Últ. pagamento", formatTs(a.lastPaymentAt))}
                    {info("Validade", formatDate(a.validUntil))}
                  </div>

                  <div style={{ display: "flex", marginTop: 16 }}>{acoes(a, true)}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="dark-scroll" style={{ background: "#111", border: "1px solid #222", borderRadius: 10, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ ...th, paddingLeft: 22 }}>Atleta</th>
                  <th style={th}>Academia</th>
                  <th style={th}>Faixa</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("lastPaymentAt")}>Últ. pagamento{sortArrow("lastPaymentAt")}</th>
                  <th style={{ ...th, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("validUntil")}>Validade{sortArrow("validUntil")}</th>
                  <th style={{ ...th, textAlign: "right", paddingRight: 22 }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {paginados.map((a) => {
                  const eff = effectiveStatus(a.status, a.validUntil)
                  const s = STATUS[eff] ?? STATUS.pending
                  const isInactive = eff === "inactive"
                  return (
                    <tr key={a.cpf}>
                      <td style={{ ...td, paddingLeft: 22 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: "#0A0A0A", border: "1px solid #333", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {a.photoURL ? <img src={a.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div title={a.fullName} style={{ color: isInactive ? "#888" : "#fff", fontWeight: 700, textDecoration: isInactive ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis" }}>{a.fullName}</div>
                            <div style={{ color: "#666", fontSize: 11 }}>{formatCpf(a.cpf)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={td} title={academyName(a.academyId)}>{academyName(a.academyId)}</td>
                      <td style={td}>{BELT_LABELS[a.belt] ?? "—"}</td>
                      <td style={td}>{ROLE_LABELS[a.role] ?? "—"}</td>
                      <td style={td}><span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.text}</span></td>
                      <td style={td}>{formatTs(a.lastPaymentAt)}</td>
                      <td style={td}>{formatDate(a.validUntil)}</td>
                      <td style={{ ...td, textAlign: "right", paddingRight: 22 }}>
                        <div style={{ display: "inline-flex" }}>{acoes(a)}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* A barra só faz sentido havendo resultado: sem filiado visível não
            há o que paginar. */}
        {!carregando && visiveis.length > 0 && (
          <Paginacao
            total={visiveis.length}
            pagina={paginaAtual}
            porPagina={porPagina}
            isMobile={isMobile}
            onPagina={setPagina}
            onPorPagina={setPorPagina}
          />
        )}

        {/* ===== Configurações do cadastro ===== */}
        <div style={{ marginTop: 56, borderTop: "1px solid #1c1c1c", paddingTop: 36 }}>
          <div style={{ color: "#F0B90B", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
            Opções do formulário
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#fff", letterSpacing: 2, margin: 0 }}>
            Configurações do cadastro
          </h2>
          <p style={{ color: "#666", fontSize: 13, margin: "8px 0 0" }}>
            As academias abaixo são as opções que aparecem na tela de filiação.
          </p>

          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: isMobile ? "20px 16px" : "24px 22px", marginTop: 20 }}>
            <div style={{ color: "#888", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>
              Academias {!carregandoAcademias && `(${academies.length})`}
            </div>

            {carregandoAcademias ? (
              <p style={{ color: "#666", fontSize: 14, margin: 0 }}>Carregando academias...</p>
            ) : erroAcademias ? (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", fontSize: 13, padding: "10px 14px", borderRadius: 6 }}>
                {erroAcademias}
              </div>
            ) : (
              <>
                {academies.length === 0 ? (
                  <p style={{ color: "#666", fontSize: 14, margin: "0 0 16px" }}>
                    Nenhuma academia cadastrada. Adicione a primeira para liberar a tela de filiação.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                    {academies.map((a) => {
                      // Regra: a lista nunca pode ficar vazia, senão ninguém
                      // consegue se filiar.
                      const unica = academies.length === 1
                      const editando = editandoAcademia === a.id
                      const acaoStyle = (cor: string, borda: string): React.CSSProperties => ({
                        background: "none", border: `1px solid ${borda}`, borderRadius: 5, color: cor,
                        fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase",
                        padding: "8px 12px", flexShrink: 0, cursor: "pointer",
                      })
                      return (
                        <div
                          key={a.id}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#0A0A0A", border: "1px solid #222", borderRadius: 6, padding: "12px 14px", flexWrap: "wrap" }}
                        >
                          {editando ? (
                            <>
                              <input
                                value={nomeEditado}
                                onChange={(e) => { setNomeEditado(e.target.value); setErroAcademiaForm("") }}
                                aria-label={`Novo nome de ${a.name}`}
                                autoFocus
                                style={{ background: "#111", border: "1px solid #F0B90B", color: "#eee", fontSize: 14, padding: "8px 10px", borderRadius: 5, outline: "none", flex: "1 1 180px", minWidth: 0 }}
                              />
                              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => salvarEdicao(a)}
                                  disabled={salvandoEdicao}
                                  style={{ ...acaoStyle("#0A0A0A", "#F0B90B"), background: "#F0B90B", opacity: salvandoEdicao ? 0.6 : 1 }}
                                >
                                  {salvandoEdicao ? "..." : "Salvar"}
                                </button>
                                <button type="button" onClick={cancelarEdicao} style={acaoStyle("#999", "#444")}>
                                  Cancelar
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <span style={{ color: "#eee", fontSize: 14, fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                                {a.name}
                              </span>
                              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => iniciarEdicao(a)}
                                  aria-label={`Editar ${a.name}`}
                                  title={`Editar ${a.name}`}
                                  style={acaoStyle("#F0B90B", "rgba(240,185,11,0.4)")}
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { if (!unica) setAlvoRemoverAcademia(a) }}
                                  disabled={unica || removendoAcademia === a.id}
                                  aria-label={`Remover ${a.name}`}
                                  title={unica ? "É preciso manter ao menos uma academia" : `Remover ${a.name}`}
                                  style={{
                                    ...acaoStyle(unica ? "#3d3d3d" : "#ef4444", unica ? "#2a2a2a" : "rgba(239,68,68,0.4)"),
                                    cursor: unica ? "default" : "pointer",
                                  }}
                                >
                                  {removendoAcademia === a.id ? "..." : "Remover"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <form onSubmit={adicionarAcademia} style={{ display: "flex", gap: 10, flexWrap: "wrap", ...(isMobile ? { flexDirection: "column" } : {}) }}>
                  <input
                    value={novaAcademia}
                    onChange={(e) => { setNovaAcademia(e.target.value); setErroAcademiaForm("") }}
                    placeholder="Nome da nova academia"
                    aria-label="Nome da nova academia"
                    style={{ background: "#0A0A0A", border: "1px solid #2a2a2a", color: "#eee", fontSize: 13, padding: "12px 14px", borderRadius: 6, outline: "none", ...(isMobile ? { width: "100%" } : { flex: "1 1 260px" }) }}
                  />
                  <button
                    type="submit"
                    disabled={salvandoAcademia}
                    style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 12, fontWeight: 800, padding: "12px 20px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer", opacity: salvandoAcademia ? 0.6 : 1, ...(isMobile ? { width: "100%" } : {}) }}
                  >
                    {salvandoAcademia ? "Adicionando..." : "Adicionar"}
                  </button>
                </form>

                {erroAcademiaForm && (
                  <div style={{ color: "#f87171", fontSize: 12, marginTop: 10 }}>{erroAcademiaForm}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menu de ações (M-01) — fora do container com overflow para não ser
          cortado nem criar barra de rolagem ao abrir. */}
      {menuAberto && (() => {
        const alvo = visiveis.find((r) => r.cpf === menuAberto.cpf)
        if (!alvo) return null
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: menuAberto.top, right: menuAberto.right, background: "#181818", border: "1px solid #2e2e2e", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", zIndex: 50, minWidth: 180, overflow: "hidden", padding: 4 }}
          >
            {effectiveStatus(alvo.status, alvo.validUntil) === "active" && (
              <button
                onClick={() => { setMenuAberto(null); setAlvoRemoverPagamento(alvo) }}
                disabled={removendoPagamento === alvo.cpf}
                style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: "#ef4444", fontSize: 13, fontWeight: 600, padding: "11px 14px", borderRadius: 5, cursor: "pointer" }}
              >
                Remover pagamento
              </button>
            )}
            <button
              onClick={() => { setMenuAberto(null); setAlvoRemover(alvo) }}
              disabled={removendo === alvo.cpf}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: "#ef4444", fontSize: 13, fontWeight: 600, padding: "11px 14px", borderRadius: 5, cursor: "pointer" }}
            >
              Remover atleta
            </button>
          </div>
        )
      })()}

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
              Confirmar o pagamento da anuidade de <strong style={{ color: "#fff" }}>{alvoPagar.fullName}</strong>, registrado em <strong style={{ color: "#F0B90B" }}>{monthLabel(currentMonth())}</strong>?
              <br />A filiação será ativada e a carteirinha liberada (validade +1 ano).
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
      {/* Modal de remoção de academia */}
      {alvoRemoverAcademia && (() => {
        // Quantos filiados ficariam apontando para uma academia inexistente.
        const emUso = rows.filter((r) => r.academyId === alvoRemoverAcademia.id).length
        return (
          <div
            onClick={() => setAlvoRemoverAcademia(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 400, background: "#141414", border: "1px solid #2a2a2a", borderLeft: "4px solid #ef4444", borderRadius: 10, padding: "28px 24px" }}
            >
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#fff", letterSpacing: 1, margin: "0 0 8px" }}>
                Remover academia
              </h2>
              <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.5, margin: "0 0 22px" }}>
                Remover <strong style={{ color: "#fff" }}>{alvoRemoverAcademia.name}</strong> das opções de cadastro?
                {emUso > 0 && (
                  <>
                    <br /><strong style={{ color: "#F0B90B" }}>
                      {emUso} {emUso === 1 ? "filiado usa" : "filiados usam"} esta academia
                    </strong> e {emUso === 1 ? "ficará" : "ficarão"} sem academia na lista e na carteirinha.
                  </>
                )}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => excluirAcademia(alvoRemoverAcademia)}
                  style={{ flex: 1, minWidth: 120, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 800, padding: "13px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer" }}
                >
                  Remover
                </button>
                <button
                  onClick={() => setAlvoRemoverAcademia(null)}
                  style={{ flex: 1, minWidth: 120, background: "none", color: "#999", fontSize: 13, fontWeight: 700, padding: "13px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase", border: "1px solid #444", cursor: "pointer" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Modal de remoção de pagamento */}
      {alvoRemoverPagamento && (
        <div
          onClick={() => setAlvoRemoverPagamento(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 400, background: "#141414", border: "1px solid #2a2a2a", borderLeft: "4px solid #ef4444", borderRadius: 10, padding: "28px 24px" }}
          >
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#fff", letterSpacing: 1, margin: "0 0 8px" }}>
              Remover pagamento
            </h2>
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.5, margin: "0 0 22px" }}>
              Remover o pagamento de <strong style={{ color: "#fff" }}>{alvoRemoverPagamento.fullName}</strong>?
              <br />A filiação volta a ficar <strong style={{ color: "#fff" }}>pendente</strong>, a validade é removida e a carteirinha deixa de ser exibida. A leitura do QR Code passa a mostrar "pagamento pendente".
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => removerPagamento(alvoRemoverPagamento)}
                style={{ flex: 1, minWidth: 120, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 800, padding: "13px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer" }}
              >
                Remover
              </button>
              <button
                onClick={() => setAlvoRemoverPagamento(null)}
                style={{ flex: 1, minWidth: 120, background: "none", color: "#999", fontSize: 13, fontWeight: 700, padding: "13px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase", border: "1px solid #444", cursor: "pointer" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
              <br />O registro é <strong style={{ color: "#fff" }}>mantido</strong> (histórico preservado) e apenas marcado como inativo. A carteirinha será invalidada e o CPF ficará <strong style={{ color: "#fff" }}>liberado</strong> para uma nova filiação.
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
