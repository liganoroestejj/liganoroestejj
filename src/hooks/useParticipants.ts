import { useEffect, useState } from "react"
import { ensureListed, listParticipants, prepareSelf, type Participant } from "../lib/participants"

/**
 * Lista de inscritos do Open Pádua para o atleta logado.
 * `liberado` fica false para quem não tem inscrição: a lista é só entre
 * inscritos (pagos ou pendentes) — o admin também vê.
 */
export function useParticipants(uid: string | undefined, isAdmin = false) {
  const [participantes, setParticipantes] = useState<Participant[]>([])
  const [carregando, setCarregando] = useState(true)
  const [liberado, setLiberado] = useState(false)
  const [erro, setErro] = useState("")

  useEffect(() => {
    if (!uid) return
    let ativo = true
    setCarregando(true)
    setErro("")
    ;(async () => {
      try {
        // Confere a própria inscrição (e se libera): quem acabou de se
        // inscrever não espera o admin abrir a aba de inscrições.
        const eu = isAdmin ? null : await prepareSelf(uid)
        const pode = isAdmin || !!eu
        if (!ativo) return
        setLiberado(pode)
        if (pode) {
          let lista = await listParticipants()
          // O próprio atleta entra (ou se atualiza) na lista ao abri-la.
          if (eu) lista = await ensureListed(eu, lista)
          if (ativo) setParticipantes(lista)
        }
      } catch (err) {
        console.error("[inscritos] falha ao carregar a lista:", err)
        if (ativo) setErro("Não foi possível carregar a lista de inscritos.")
      } finally {
        if (ativo) setCarregando(false)
      }
    })()
    return () => { ativo = false }
  }, [uid, isAdmin])

  return { participantes, carregando, liberado, erro }
}
