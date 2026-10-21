import { useEffect, useMemo, useState } from "react"
import type { AdminAffiliate } from "../../lib/affiliates"
import type { Academy } from "../../lib/academies"
import { BELT_LABELS, categoryFromBirthDate, GENDER_LABELS } from "../../lib/affiliateOptions"
import { formatCpf } from "../../lib/cpf"
import { competitionCategoryLabel, weightClass } from "../../lib/weightClasses"
import { getEventById, getEventDate } from "../../data/events"
import { PADUA_EVENT_ID } from "../../lib/registrations"
import {
  listRegistrations,
  reactivateRegistration,
  removeRegistration,
  setRegistrationPaid,
  type Registration,
} from "../../lib/registrations"
import { formatTs, Paginacao, STATUS, td, th } from "./adminShared"

/** Inscrição já cruzada com a filiação (dados sempre atuais, buscados pelo CPF). */
interface Linha extends Registration {
  fullName: string
  academyId: number
  belt: number
  photoURL?: string
  birthDate?: string
  gender?: number
  /** Inscrição cujo CPF não tem mais filiação (atleta removido do cadastro). */
  orfa: boolean
}

type StatusFiltro = "all" | "paid" | "pending" | "removed"
type AcademiaFiltro = "all" | number
// O sexo importa no chaveamento, então filtra só aqui, na lista do evento.
type SexoFiltro = "all" | number
type SortKey = "createdAt" | "fee" | "weight" | null

export default function InscricoesPadua({
  affiliates,
  academies,
  academyName,
  isMobile,
}: {
  affiliates: AdminAffiliate[]
  academies: Academy[]
  academyName: (id: number) => string
  isMobile: boolean
}) {
  const [rows, setRows] = useState<Registration[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<Linha | null>(null)
  const [alvoRemover, setAlvoRemover] = useState<Linha | null>(null)
  const [alvoReativar, setAlvoReativar] = useState<Linha | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [menuAberto, setMenuAberto] = useState<{ cpf: string; top: number; right: number } | null>(null)

  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState<StatusFiltro>("all")
  const [academiaFiltro, setAcademiaFiltro] = useState<AcademiaFiltro>("all")
  const [sexoFiltro, setSexoFiltro] = useState<SexoFiltro>("all")
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)

  useEffect(() => {
    let ativo = true
    listRegistrations()
      .then((r) => { if (ativo) setRows(r) })
      .catch(() => { if (ativo) setErro("Não foi possível carregar as inscrições.") })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  // Um clique em qualquer lugar fecha o menu de ações.
  useEffect(() => {
    if (!menuAberto) return
    const fechar = () => setMenuAberto(null)
    window.addEventListener("click", fechar)
    window.addEventListener("scroll", fechar, true)
    return () => {
      window.removeEventListener("click", fechar)
      window.removeEventListener("scroll", fechar, true)
    }
  }, [menuAberto])

  // O cruzamento é por CPF e em memória: a lista do admin já traz os filiados,
  // então faixa, academia e categoria saem sempre do cadastro atual — é a
  // faixa do dia do evento que vale, não a do dia da inscrição.
  const linhas = useMemo<Linha[]>(() => {
    const porCpf = new Map(affiliates.map((a) => [a.cpf, a]))
    return rows.map((r) => {
      const a = porCpf.get(r.cpf)
      return {
        ...r,
        fullName: a?.fullName ?? "Filiação removida",
        academyId: a?.academyId ?? 0,
        belt: a?.belt ?? 0,
        photoURL: a?.photoURL,
        birthDate: a?.birthDate,
        gender: a?.gender,
        orfa: !a,
      }
    })
  }, [rows, affiliates])

  // Removidas não contam como inscrição: ficam só na lista "Removidas".
  const ativas = linhas.filter((l) => l.status !== "removed")
  const removidas = linhas.length - ativas.length
  const pagos = ativas.filter((l) => l.status === "paid").length
  const pendentes = ativas.length - pagos
  const arrecadado = ativas.filter((l) => l.status === "paid").reduce((s, l) => s + (l.fee ?? 0), 0)

  const visiveis = useMemo(() => {
    // Como na lista de filiados: removidas só aparecem no filtro próprio.
    let list = filtro === "removed"
      ? linhas.filter((l) => l.status === "removed")
      : linhas.filter((l) => l.status !== "removed")
    if (filtro === "paid") list = list.filter((l) => l.status === "paid")
    else if (filtro === "pending") list = list.filter((l) => l.status === "pending")
    if (academiaFiltro !== "all") list = list.filter((l) => l.academyId === academiaFiltro)
    if (sexoFiltro !== "all") list = list.filter((l) => l.gender === sexoFiltro)
    const q = busca.trim().toLowerCase()
    if (q) {
      const digits = q.replace(/\D/g, "")
      list = list.filter((l) =>
        l.fullName.toLowerCase().includes(q) ||
        (!!digits && l.cpf.replace(/\D/g, "").includes(digits)) ||
        academyName(l.academyId).toLowerCase().includes(q),
      )
    }
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const valorDe = (l: Linha) =>
          sortKey === "fee" ? (l.fee ?? 0)
            : sortKey === "weight" ? (l.weight ?? 0)
              : (l.createdAt?.seconds ?? 0)
        const av = valorDe(a)
        const bv = valorDe(b)
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return list
  }, [linhas, filtro, academiaFiltro, sexoFiltro, busca, sortKey, sortDir, academyName])

  // Mudou filtro, busca ou ordenação: volta para a 1ª página.
  useEffect(() => { setPagina(1) }, [filtro, academiaFiltro, sexoFiltro, busca, sortKey, sortDir, porPagina])

  const totalPaginas = Math.max(1, Math.ceil(visiveis.length / porPagina))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const paginados = useMemo(
    () => visiveis.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina),
    [visiveis, paginaAtual, porPagina],
  )

  function toggleSort(key: Exclude<SortKey, null>) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }
  /**
   * Cabeçalho clicável. A seta fica sempre visível (apagada quando a coluna
   * não é a ordenada): sem ela nada indicava que dava para ordenar.
   */
  const thOrdenavel = (label: string, key: Exclude<SortKey, null>) => {
    const ativa = sortKey === key
    return (
      <th
        style={{ ...th, cursor: "pointer", userSelect: "none", color: ativa ? "#F0B90B" : "#666" }}
        onClick={() => toggleSort(key)}
        title={`Ordenar por ${label.toLowerCase()}`}
        aria-sort={ativa ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      >
        {label}
        <span aria-hidden="true" style={{ marginLeft: 5, opacity: ativa ? 1 : 0.45 }}>
          {ativa ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </th>
    )
  }

  async function alternarPagamento(l: Linha) {
    setAlvo(null)
    setSalvando(l.cpf)
    const pago = l.status !== "paid"
    try {
      await setRegistrationPaid(l.cpf, pago)
      setRows((rs) => rs.map((r) => (r.cpf === l.cpf ? { ...r, status: pago ? "paid" : "pending" } : r)))
    } catch {
      setErro(`Não foi possível atualizar o pagamento de ${l.fullName}.`)
    } finally {
      setSalvando(null)
    }
  }

  async function removerInscricao(l: Linha) {
    setAlvoRemover(null)
    setRemovendo(l.cpf)
    try {
      await removeRegistration(l.cpf)
      setRows((rs) => rs.map((r) => (r.cpf === l.cpf ? { ...r, status: "removed" } : r)))
    } catch {
      setErro(`Não foi possível remover a inscrição de ${l.fullName}.`)
    } finally {
      setRemovendo(null)
    }
  }

  // Volta sempre como pendente: inscrição removida não guarda o pagamento.
  async function reativarInscricao(l: Linha) {
    setAlvoReativar(null)
    setRemovendo(l.cpf)
    try {
      await reactivateRegistration(l.cpf)
      setRows((rs) => rs.map((r) => (r.cpf === l.cpf ? { ...r, status: "pending" } : r)))
    } catch {
      setErro(`Não foi possível reativar a inscrição de ${l.fullName}.`)
    } finally {
      setRemovendo(null)
    }
  }

  const resumoItem = (label: string, count: number, key: StatusFiltro, color: string) => (
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

  const acao = (l: Linha, largura?: boolean) => {
    const pago = l.status === "paid"
    const ocupado = salvando === l.cpf || removendo === l.cpf
    // Removida: a única ação é devolvê-la à lista, como no filiado removido.
    if (l.status === "removed") {
      return (
        <div style={{ display: "flex", alignItems: "center", flex: largura ? 1 : undefined }}>
          <button
            onClick={() => setAlvoReativar(l)}
            disabled={ocupado}
            title={`Devolver a inscrição de ${l.fullName} à lista`}
            style={{ flex: largura ? 1 : undefined, background: "rgba(34,197,94,0.12)", color: "#22c55e", fontSize: 11, fontWeight: 800, padding: "8px 14px", borderRadius: 5, letterSpacing: 0.5, textTransform: "uppercase", border: "1px solid rgba(34,197,94,0.4)", cursor: "pointer", opacity: ocupado ? 0.6 : 1 }}
          >
            {ocupado ? "..." : "Reativar inscrição"}
          </button>
        </div>
      )
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: largura ? 10 : 16, flex: largura ? 1 : undefined }}>
        {pago ? (
          // Pago não é botão: desfazer fica no menu, como na lista de filiados.
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, background: "rgba(34,197,94,0.12)", color: "#22c55e", fontSize: 11, fontWeight: 800, padding: "8px 14px", borderRadius: 5, letterSpacing: 0.5, textTransform: "uppercase", ...(largura ? { flex: 1 } : {}) }}>
            ✓ Pago
          </span>
        ) : (
          <button
            onClick={() => setAlvo(l)}
            disabled={ocupado}
            style={{
              background: "#F0B90B", color: "#0A0A0A", border: "none",
              fontSize: 11, fontWeight: 800, padding: "8px 14px", borderRadius: 5,
              letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
              opacity: ocupado ? 0.6 : 1,
              ...(largura ? { flex: 1 } : {}),
            }}
          >
            {salvando === l.cpf ? "Salvando..." : "Marcar pago"}
          </button>
        )}

        {/* Menu de ações — hoje só remover a inscrição. */}
        <button
          aria-label="Ações"
          onClick={(e) => {
            e.stopPropagation()
            const r = e.currentTarget.getBoundingClientRect()
            setMenuAberto((m) => (m?.cpf === l.cpf ? null : { cpf: l.cpf, top: r.bottom + 16, right: window.innerWidth - r.right }))
          }}
          style={{ background: "none", border: "1px solid #333", color: "#999", width: 34, height: 34, borderRadius: 6, cursor: "pointer", fontSize: 16, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          ⋮
        </button>
      </div>
    )
  }

  // A categoria vale pela idade NO DIA DO EVENTO, não pela de hoje: quem faz
  // aniversário até lá compete na categoria nova — é assim que o valor da
  // inscrição já é cobrado.
  const eventoEm = getEventDate(getEventById(PADUA_EVENT_ID)!) ?? new Date()
  const categoriaId = (l: Linha) =>
    l.birthDate ? categoryFromBirthDate(l.birthDate, eventoEm).id : undefined

  // No campeonato, até 9 anos tudo é Festival; daí para cima vale a categoria
  // de idade.
  const categoria = (l: Linha) => {
    const id = categoriaId(l)
    return id === undefined ? "—" : competitionCategoryLabel(id)
  }

  /**
   * Categoria de peso pela tabela do sexo do atleta. Infantil e juvenil têm
   * tabela própria, ainda não cadastrada: nesses casos fica só o peso.
   */
  const classePeso = (l: Linha) =>
    weightClass({
      weight: l.weight,
      gender: l.gender,
      ageCategoryId: categoriaId(l),
    })

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, marginBottom: 22, flexWrap: "wrap" }}>
        {resumoItem("inscritos", ativas.length, "all", "#888")}
        <span style={{ color: "#333" }}>·</span>
        {resumoItem("pagos", pagos, "paid", "#22c55e")}
        <span style={{ color: "#333" }}>·</span>
        {resumoItem("pendentes", pendentes, "pending", "#F0B90B")}
        {removidas > 0 && (
          <>
            <span style={{ color: "#333" }}>·</span>
            {resumoItem("removidas", removidas, "removed", "#888")}
          </>
        )}
        <span style={{ color: "#333" }}>·</span>
        <span style={{ color: "#888", fontSize: 13, padding: "2px 8px" }}>R$ {arrecadado},00 recebidos</span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <select
          value={String(academiaFiltro)}
          onChange={(e) => setAcademiaFiltro(e.target.value === "all" ? "all" : Number(e.target.value))}
          aria-label="Filtrar por academia"
          style={{
            appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
            backgroundColor: "#111",
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' fill='none' stroke='%23999' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            border: "1px solid #2a2a2a", color: academiaFiltro === "all" ? "#999" : "#F0B90B",
            fontSize: 13, padding: "12px 38px 12px 14px", borderRadius: 6, outline: "none", cursor: "pointer",
            ...(isMobile ? { width: "100%" } : { minWidth: 190, maxWidth: 240 }),
          }}
        >
          <option value="all">Todas as academias</option>
          {academies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select
          value={String(sexoFiltro)}
          onChange={(e) => setSexoFiltro(e.target.value === "all" ? "all" : Number(e.target.value))}
          aria-label="Filtrar por sexo"
          style={{
            appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
            backgroundColor: "#111",
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' fill='none' stroke='%23999' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            border: "1px solid #2a2a2a", color: sexoFiltro === "all" ? "#999" : "#F0B90B",
            fontSize: 13, padding: "12px 38px 12px 14px", borderRadius: 6, outline: "none", cursor: "pointer",
            ...(isMobile ? { width: "100%" } : { minWidth: 150, maxWidth: 190 }),
          }}
        >
          <option value="all">Todos os sexos</option>
          {Object.entries(GENDER_LABELS).map(([gid, label]) => (
            <option key={gid} value={gid}>{label}</option>
          ))}
        </select>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, CPF ou academia..."
          style={{ background: "#111", border: "1px solid #2a2a2a", color: "#eee", fontSize: 13, padding: "12px 14px", borderRadius: 6, outline: "none", ...(isMobile ? { width: "100%" } : { minWidth: 240, flex: "1 1 240px", maxWidth: 360 }) }}
        />
      </div>

      {erro && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 18 }}>{erro}</div>}

      {carregando ? (
        <p style={{ color: "#666", fontSize: 14 }}>Carregando inscrições...</p>
      ) : linhas.length === 0 ? (
        <p style={{ color: "#666", fontSize: 14 }}>Nenhuma inscrição ainda.</p>
      ) : visiveis.length === 0 ? (
        <p style={{ color: "#666", fontSize: 14 }}>Nenhuma inscrição encontrada para os filtros atuais.</p>
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {paginados.map((l) => {
            const s = STATUS[l.status] ?? STATUS.pending
            const info = (label: string, valor: string) => (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                <span style={{ color: "#666" }}>{label}</span>
                <span style={{ color: "#ddd", textAlign: "right" }}>{valor}</span>
              </div>
            )
            return (
              <div key={l.cpf} style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: "#0A0A0A", border: "1px solid #333", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {l.photoURL ? <img src={l.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: l.orfa || l.status === "removed" ? "#888" : "#fff", fontWeight: 700, fontSize: 15, textDecoration: l.status === "removed" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis" }}>{l.fullName}</div>
                    <div style={{ color: "#666", fontSize: 11 }}>{formatCpf(l.cpf)}</div>
                  </div>
                  <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 800, padding: "4px 9px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{s.text}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 14, borderTop: "1px solid #1c1c1c" }}>
                  {info("Academia", academyName(l.academyId))}
                  {info("Faixa", BELT_LABELS[l.belt] ?? "—")}
                  {info("Sexo", l.gender ? GENDER_LABELS[l.gender] ?? "—" : "—")}
                  {info("Categoria", categoria(l))}
                  {info(
                    "Categoria de peso",
                    l.weight ? `${classePeso(l) ?? "—"} · ${l.weight} kg` : "—",
                  )}
                  {info("Valor", `R$ ${l.fee},00`)}
                  {info("Inscrito em", formatTs(l.createdAt))}
                </div>
                <div style={{ display: "flex", marginTop: 16 }}>{acao(l, true)}</div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="dark-scroll" style={{ background: "#111", border: "1px solid #222", borderRadius: 10, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720, tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "17%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "18%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ ...th, paddingLeft: 22 }}>Atleta</th>
                <th style={th}>Academia</th>
                <th style={th}>Faixa</th>
                <th style={th}>Sexo</th>
                <th style={th}>Categoria</th>
                {thOrdenavel("Cat. de peso", "weight")}
                {thOrdenavel("Valor", "fee")}
                {thOrdenavel("Inscrito em", "createdAt")}
                <th style={{ ...th, textAlign: "right", paddingRight: 76 }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginados.map((l) => {
                return (
                  <tr key={l.cpf}>
                    <td style={{ ...td, paddingLeft: 22 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: "#0A0A0A", border: "1px solid #333", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {l.photoURL ? <img src={l.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div title={l.fullName} style={{ color: l.orfa || l.status === "removed" ? "#888" : "#fff", fontWeight: 700, textDecoration: l.status === "removed" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis" }}>{l.fullName}</div>
                          <div style={{ color: "#666", fontSize: 11 }}>{formatCpf(l.cpf)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td} title={academyName(l.academyId)}>{academyName(l.academyId)}</td>
                    <td style={td}>{BELT_LABELS[l.belt] ?? "—"}</td>
                    <td style={td}>{l.gender ? GENDER_LABELS[l.gender] ?? "—" : "—"}</td>
                    <td style={td}>{categoria(l)}</td>
                    <td
                      style={td}
                      title={l.weight && !classePeso(l) ? "Sem categoria de peso: só Adulto e Master usam a tabela. Agrupe por peso na hora do chaveamento." : undefined}
                    >
                      {l.weight ? (
                        <>
                          <div style={{ color: classePeso(l) ? "#fff" : "#888", fontWeight: 700 }}>
                            {classePeso(l) ?? `${l.weight} kg`}
                          </div>
                          {classePeso(l) && <div style={{ color: "#666", fontSize: 11 }}>{l.weight} kg</div>}
                        </>
                      ) : "—"}
                    </td>
                    <td style={td}>R$ {l.fee},00</td>
                    <td style={td}>{formatTs(l.createdAt)}</td>
                    <td style={{ ...td, textAlign: "right", paddingRight: 22, overflow: "visible", textOverflow: "clip" }}>
                      <div style={{ display: "inline-flex", alignItems: "center" }}>{acao(l)}</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!carregando && visiveis.length > 0 && (
        <Paginacao
          total={visiveis.length}
          pagina={paginaAtual}
          porPagina={porPagina}
          isMobile={isMobile}
          onPagina={setPagina}
          onPorPagina={setPorPagina}
          rotulo="inscrito"
        />
      )}

      {/* Menu de ações — fora da tabela, que tem overflow próprio. */}
      {menuAberto && (() => {
        const l = visiveis.find((x) => x.cpf === menuAberto.cpf)
        if (!l) return null
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: menuAberto.top, right: menuAberto.right, background: "#181818", border: "1px solid #2e2e2e", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", zIndex: 50, minWidth: 180, overflow: "hidden", padding: 4 }}
          >
            {l.status === "paid" && (
              <button
                onClick={() => { setMenuAberto(null); setAlvo(l) }}
                style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: "#ef4444", fontSize: 13, fontWeight: 600, padding: "11px 14px", borderRadius: 5, cursor: "pointer" }}
              >
                Desfazer pagamento
              </button>
            )}
            <button
              onClick={() => { setMenuAberto(null); setAlvoRemover(l) }}
              disabled={removendo === l.cpf}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: "#ef4444", fontSize: 13, fontWeight: 600, padding: "11px 14px", borderRadius: 5, cursor: "pointer" }}
            >
              Remover inscrição
            </button>
          </div>
        )
      })()}

      {/* Remover inscrição — some da lista do campeonato; o atleta pode se
          inscrever de novo pela tela do evento. */}
      {alvoRemover && (
        <div
          onClick={() => setAlvoRemover(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 24, maxWidth: 380, width: "100%" }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Remover inscrição?</div>
            <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, margin: "0 0 20px" }}>
              A inscrição de {alvoRemover.fullName} sai da lista e fica em
              "Removidas", de onde pode voltar. Se voltar, volta como pendente
              de pagamento.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setAlvoRemover(null)} style={{ background: "none", color: "#999", border: "1px solid #444", fontSize: 12, fontWeight: 700, padding: "10px 18px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={() => removerInscricao(alvoRemover)} style={{ background: "#ef4444", color: "#fff", border: "none", fontSize: 12, fontWeight: 800, padding: "10px 18px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {alvoReativar && (
        <div
          onClick={() => setAlvoReativar(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 24, maxWidth: 380, width: "100%" }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Reativar inscrição?</div>
            <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, margin: "0 0 20px" }}>
              A inscrição de {alvoReativar.fullName} volta à lista como pendente
              de pagamento, mesmo que estivesse paga antes.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setAlvoReativar(null)} style={{ background: "none", color: "#999", border: "1px solid #444", fontSize: 12, fontWeight: 700, padding: "10px 18px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={() => reativarInscricao(alvoReativar)} style={{ background: "#F0B90B", color: "#0A0A0A", border: "none", fontSize: 12, fontWeight: 800, padding: "10px 18px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                Reativar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação — marcar ou desfazer pagamento é escrita, não clique solto. */}
      {alvo && (
        <div
          onClick={() => setAlvo(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 24, maxWidth: 380, width: "100%" }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
              {alvo.status === "paid" ? "Desfazer pagamento?" : "Confirmar pagamento?"}
            </div>
            <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, margin: "0 0 20px" }}>
              {alvo.status === "paid"
                ? `A inscrição de ${alvo.fullName} volta a ficar pendente.`
                : `A inscrição de ${alvo.fullName} (R$ ${alvo.fee},00) será marcada como paga.`}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setAlvo(null)} style={{ background: "none", color: "#999", border: "1px solid #444", fontSize: 12, fontWeight: 700, padding: "10px 18px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={() => alternarPagamento(alvo)} style={{ background: "#F0B90B", color: "#0A0A0A", border: "none", fontSize: 12, fontWeight: 800, padding: "10px 18px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
