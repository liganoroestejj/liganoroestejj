import { useIsMobile } from "../../hooks/useMediaQuery"
import FotosDesktop from "./Fotos.desktop"
import FotosMobile from "./Fotos.mobile"

export default function Fotos() {
  const isMobile = useIsMobile()
  return isMobile ? <FotosMobile /> : <FotosDesktop />
}
