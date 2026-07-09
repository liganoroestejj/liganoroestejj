import { useIsMobile } from "../../hooks/useMediaQuery"
import CalendarioDesktop from "./Calendario.desktop"
import CalendarioMobile from "./Calendario.mobile"

export default function Calendario() {
  const isMobile = useIsMobile()
  return isMobile ? <CalendarioMobile /> : <CalendarioDesktop />
}
