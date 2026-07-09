import { useIsMobile } from "../../hooks/useMediaQuery"
import AcadesmiasDesktop from "./Academias.desktop"
import AcademiasMobile from "./Academias.mobile"

export default function Academias() {
  const isMobile = useIsMobile()
  return isMobile ? <AcademiasMobile /> : <AcadesmiasDesktop />
}
