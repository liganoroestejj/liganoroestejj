import { useIsMobile } from "../../hooks/useMediaQuery"
import RankingDesktop from "./Ranking.desktop"
import RankingMobile from "./Ranking.mobile"

export default function Ranking() {
  const isMobile = useIsMobile()
  return isMobile ? <RankingMobile /> : <RankingDesktop />
}
