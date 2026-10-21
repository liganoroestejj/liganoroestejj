import { useIsMobile } from "../../hooks/useMediaQuery"
import RegulamentoDesktop from "./Regulamento.desktop"
import RegulamentoMobile from "./Regulamento.mobile"

export default function Regulamento() {
  const isMobile = useIsMobile()
  return isMobile ? <RegulamentoMobile /> : <RegulamentoDesktop />
}
