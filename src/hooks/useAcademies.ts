import { useCallback, useEffect, useState } from "react"
import { listAcademies, type Academy } from "../lib/academies"

/**
 * Lista de academias vinda do Firestore, com estados de carregamento e erro.
 * `recarregar` refaz a leitura — o cache da lib já foi descartado pelas ações
 * de adicionar/remover.
 */
export function useAcademies() {
  const [academies, setAcademies] = useState<Academy[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  const recarregar = useCallback(async () => {
    setCarregando(true)
    setErro("")
    try {
      setAcademies(await listAcademies())
    } catch {
      setErro("Não foi possível carregar as academias.")
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { void recarregar() }, [recarregar])

  return { academies, carregando, erro, recarregar }
}
