import { useMediaQuery } from "../../hooks/useMediaQuery"
import AcadesmiasDesktop from "./Academias.desktop"
import AcademiasMobile from "./Academias.mobile"

export default function Academias() {
  const isMobile = useMediaQuery("(max-width: 1024px)")
  return isMobile ? <AcademiasMobile /> : <AcadesmiasDesktop />
}
