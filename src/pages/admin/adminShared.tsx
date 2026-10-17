/**
 * Peças compartilhadas pelas listagens do painel administrativo (filiados e
 * inscrições): cores de status, estilos de tabela e a barra de paginação.
 */

export const STATUS: Record<string, { text: string; color: string; bg: string }> = {
  pending: { text: "Pendente", color: "#F0B90B", bg: "rgba(240,185,11,0.12)" },
  active: { text: "Ativo", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  paid: { text: "Pago", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  overdue: { text: "Em atraso", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  inactive: { text: "Removido", color: "#888", bg: "rgba(136,136,136,0.12)" },
  removed: { text: "Removida", color: "#888", bg: "rgba(136,136,136,0.12)" },
}

export function formatDate(iso?: string): string {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  return d ? `${d}/${m}/${y}` : iso
}

export function formatTs(ts?: { seconds: number } | null): string {
  if (!ts) return "—"
  return new Date(ts.seconds * 1000).toLocaleDateString("pt-BR")
}

export const th: React.CSSProperties = { textAlign: "left", color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "14px 16px", background: "#141414", borderBottom: "1px solid #242424", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
export const td: React.CSSProperties = { padding: "16px 16px", borderTop: "1px solid #1c1c1c", fontSize: 13, color: "#ddd", whiteSpace: "nowrap", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" }

export const POR_PAGINA_OPCOES = [10, 15, 20, 25, 30]

/**
 * Páginas mostradas na barra. Até 7 cabem todas; acima disso vira uma janela
 * em volta da atual, com reticências, para a barra não crescer sem limite.
 */
export function paginasVisiveis(atual: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (atual <= 4) return [1, 2, 3, 4, 5, "...", total]
  if (atual >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "...", atual - 1, atual, atual + 1, "...", total]
}

/** Barra de paginação — mesmo componente no desktop e no mobile. */
export function Paginacao({ total, pagina, porPagina, isMobile, onPagina, onPorPagina, rotulo = "filiado" }: {
  total: number
  pagina: number
  porPagina: number
  isMobile: boolean
  onPagina: (p: number) => void
  onPorPagina: (n: number) => void
  /** Nome do que está sendo listado, no singular ("filiado", "inscrito"). */
  rotulo?: string
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
        Mostrando {inicio} a {fim} de {total} {total === 1 ? rotulo : `${rotulo}s`}
      </span>

      {/* Em telas estreitas a lista de páginas não cabe em uma linha (com 13
          páginas ela passa de 350px): sem quebrar, a página inteira ganhava
          rolagem horizontal. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, flexWrap: "wrap", maxWidth: "100%" }}>
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
