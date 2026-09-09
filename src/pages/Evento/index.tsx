import { useIsMobile } from "../../hooks/useMediaQuery"
import EventoDesktop from "./Evento.desktop"
import EventoMobile from "./Evento.mobile"

export default function Evento() {
  const isMobile = useIsMobile()
  return isMobile ? <EventoMobile /> : <EventoDesktop />
}
