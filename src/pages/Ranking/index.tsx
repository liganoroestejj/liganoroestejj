import { useMediaQuery } from "../../hooks/useMediaQuery"
import RankingDesktop from "./Ranking.desktop"
import RankingMobile from "./Ranking.mobile"

export default function Ranking() {
  const isMobile = useMediaQuery("(max-width: 1024px)")
  return isMobile ? <RankingMobile /> : <RankingDesktop />
}
