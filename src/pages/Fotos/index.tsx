import { useMediaQuery } from "../../hooks/useMediaQuery"
import FotosDesktop from "./Fotos.desktop"
import FotosMobile from "./Fotos.mobile"

export default function Fotos() {
  const isMobile = useMediaQuery("(max-width: 1024px)")
  return isMobile ? <FotosMobile /> : <FotosDesktop />
}
