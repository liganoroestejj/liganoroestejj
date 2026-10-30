import { Link } from "react-router-dom"
import type { InscritosState } from "./useInscritos"

const seta = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' fill='none' stroke='%23999' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>")`

const selectStyle = (ativo: boolean): React.CSSProperties => ({
  appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
  backgroundColor: "#111",
  backgroundImage: seta,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  border: "1px solid #2a2a2a", color: ativo ? "#F0B90B" : "#999",
  fontSize: 13, padding: "12px 38px 12px 14px", borderRadius: 6, outline: "none", cursor: "pointer",
})

export function Avatar({ src, size }: { src: string | null; size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 8, background: "#0A0A0A", border: "1px solid #333", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {src
        ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <svg width={size / 2.2} height={size / 2.2} viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
    </div>
  )
}

/** Selects de categoria e idade. */
export function Filtros({ st, isMobile }: { st: InscritosState; isMobile: boolean }) {
  const largura: React.CSSProperties = isMobile ? { width: "100%" } : { minWidth: 190 }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 18, ...(isMobile ? { flexDirection: "column" } : {}) }}>
      <select
        aria-label="Filtrar por categoria"
        value={st.categoria}
        onChange={(e) => st.setCategoria(e.target.value)}
        style={{ ...selectStyle(!!st.categoria), ...largura }}
      >
        <option value="">Todas as categorias</option>
        {st.categorias.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select
        aria-label="Filtrar por idade"
        value={st.idade === null ? "" : String(st.idade)}
        onChange={(e) => st.setIdade(e.target.value)}
        style={{ ...selectStyle(st.idade !== null), ...largura }}
      >
        <option value="">Todas as idades</option>
        {st.idades.map((i) => <option key={i} value={i}>{i} anos</option>)}
      </select>
      {(st.categoria || st.idade !== null) && (
        <button
          onClick={st.limparFiltros}
          style={{ background: "none", border: "none", color: "#F0B90B", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", padding: "8px 4px" }}
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}

const caixa: React.CSSProperties = { background: "#111", border: "1px solid #222", borderRadius: 10, padding: 24, color: "#999", fontSize: 14, lineHeight: 1.6, textAlign: "center" }

/**
 * Estados que não são a lista: evento sem inscrições, carregando, erro e
 * atleta sem inscrição paga. Devolve null quando é para mostrar a lista.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function estadoDaTela(st: InscritosState): React.ReactNode {
  if (!st.evento || !st.temLista) {
    return <div style={caixa}>Este evento não tem lista de inscritos.</div>
  }
  if (st.carregando) {
    return <p style={{ color: "#666", fontSize: 14 }}>Carregando inscritos...</p>
  }
  if (st.erro) {
    return (
      <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", fontSize: 13, padding: "10px 14px", borderRadius: 6 }}>
        {st.erro}
      </div>
    )
  }
  if (!st.liberado) {
    return (
      <div style={caixa}>
        A lista de inscritos é exclusiva de quem já está inscrito no
        campeonato.
        <div style={{ marginTop: 16 }}>
          <Link to={`/evento/${st.evento.id}/inscricao`} style={{ color: "#F0B90B", fontWeight: 700 }}>
            Fazer minha inscrição
          </Link>
        </div>
      </div>
    )
  }
  if (st.total === 0) return <p style={{ color: "#666", fontSize: 14 }}>Nenhum inscrito confirmado ainda.</p>
  return null
}

/** "12 inscritos confirmados · 3 na seleção". */
export function Resumo({ st }: { st: InscritosState }) {
  const filtrado = !!st.categoria || st.idade !== null
  return (
    <div style={{ color: "#888", fontSize: 13, marginBottom: 14 }}>
      {st.total} {st.total === 1 ? "inscrito confirmado" : "inscritos confirmados"}
      {filtrado && <> · <span style={{ color: "#F0B90B" }}>{st.visiveis.length} no filtro</span></>}
    </div>
  )
}
