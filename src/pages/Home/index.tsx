import { useIsMobile } from "../../hooks/useMediaQuery"
import HomeDesktop from "./Home.desktop"
import HomeMobile from "./Home.mobile"

export default function Home() {
  const isMobile = useIsMobile()
  return isMobile ? <HomeMobile /> : <HomeDesktop />
}
