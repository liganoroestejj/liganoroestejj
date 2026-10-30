import { useIsMobile } from "../../hooks/useMediaQuery"
import InscritosDesktop from "./Inscritos.desktop"
import InscritosMobile from "./Inscritos.mobile"

export default function Inscritos() {
  const isMobile = useIsMobile()
  return isMobile ? <InscritosMobile /> : <InscritosDesktop />
}
