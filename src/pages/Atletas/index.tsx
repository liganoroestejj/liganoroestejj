import { useIsMobile } from "../../hooks/useMediaQuery"
import AtletasDesktop from "./Atletas.desktop"
import AtletasMobile from "./Atletas.mobile"

export default function Atletas() {
  const isMobile = useIsMobile()
  return isMobile ? <AtletasMobile /> : <AtletasDesktop />
}
