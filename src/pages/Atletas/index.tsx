import { useMediaQuery } from "../../hooks/useMediaQuery"
import AtletasDesktop from "./Atletas.desktop"
import AtletasMobile from "./Atletas.mobile"

export default function Atletas() {
  const isMobile = useMediaQuery("(max-width: 1024px)")
  return isMobile ? <AtletasMobile /> : <AtletasDesktop />
}
