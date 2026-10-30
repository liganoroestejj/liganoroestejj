import { useMemo } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useAcademies } from "../../hooks/useAcademies"
import { useParticipants } from "../../hooks/useParticipants"
import { getEventById } from "../../data/events"
import { PADUA_EVENT_ID } from "../../lib/registrations"
import { ageOptions, categoryOptions, sortParticipants } from "../../lib/participants"

/**
 * Estado da tela de inscritos, comum às versões desktop e mobile. Os filtros
 * ficam na URL (?categoria=Adulto&idade=25), para o link poder ser repassado
 * já filtrado.
 */
export function useInscritos() {
  const { id } = useParams()
  const evento = getEventById(id)
  // Só o Open Pádua tem inscrições no site.
  const temLista = !!evento && evento.id === PADUA_EVENT_ID

  const { user, isAdmin } = useAuth()
  const { participantes, carregando, liberado, erro } = useParticipants(temLista ? user?.uid : undefined, isAdmin)
  const { academies } = useAcademies()
  const academyName = (aid: number) => academies.find((a) => a.id === aid)?.name ?? "—"

  const [params, setParams] = useSearchParams()
  const categoria = params.get("categoria") ?? ""
  const idadeParam = params.get("idade")
  const idade = idadeParam !== null && idadeParam !== "" ? Number(idadeParam) : null

  function setFiltro(chave: "categoria" | "idade", valor: string) {
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (valor) n.set(chave, valor)
      else n.delete(chave)
      // Trocar a categoria pode deixar a idade escolhida fora dela.
      if (chave === "categoria") n.delete("idade")
      return n
    }, { replace: true })
  }

  const categorias = useMemo(() => categoryOptions(participantes), [participantes])
  const daCategoria = useMemo(
    () => (categoria ? participantes.filter((p) => p.category === categoria) : participantes),
    [participantes, categoria],
  )
  // As idades oferecidas são as da categoria escolhida.
  const idades = useMemo(() => ageOptions(daCategoria), [daCategoria])
  const visiveis = useMemo(
    () => sortParticipants(idade === null ? daCategoria : daCategoria.filter((p) => p.age === idade)),
    [daCategoria, idade],
  )

  return {
    evento,
    temLista,
    carregando: temLista && carregando,
    liberado,
    erro,
    total: participantes.length,
    visiveis,
    categorias,
    idades,
    categoria,
    idade,
    setCategoria: (v: string) => setFiltro("categoria", v),
    setIdade: (v: string) => setFiltro("idade", v),
    limparFiltros: () => setParams({}, { replace: true }),
    academyName,
  }
}

export type InscritosState = ReturnType<typeof useInscritos>
