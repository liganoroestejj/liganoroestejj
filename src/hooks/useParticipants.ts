import { useEffect, useState } from "react"
import { isParticipant, listParticipants, type Participant } from "../lib/participants"

/**
 * Lista de inscritos pagos do Open Pádua para o atleta logado.
 * `liberado` fica false para quem não tem a inscrição paga: a lista é só
 * entre inscritos confirmados (o admin também vê).
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
        const pode = isAdmin || (await isParticipant(uid))
        if (!ativo) return
        setLiberado(pode)
        if (pode) {
          const lista = await listParticipants()
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
