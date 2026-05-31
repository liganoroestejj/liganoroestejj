import { useMediaQuery } from "../../hooks/useMediaQuery"
import CalendarioDesktop from "./Calendario.desktop"
import CalendarioMobile from "./Calendario.mobile"

export default function Calendario() {
  const isMobile = useMediaQuery("(max-width: 1024px)")
  return isMobile ? <CalendarioMobile /> : <CalendarioDesktop />
}
