import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// Ao trocar de rota o navegador mantém a posição de rolagem anterior.
// Este componente leva a nova tela sempre para o topo.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
