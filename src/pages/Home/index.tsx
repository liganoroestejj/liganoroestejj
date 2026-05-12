import { useMediaQuery } from "../../hooks/useMediaQuery"
import HomeDesktop from "./Home.desktop"
import HomeMobile from "./Home.mobile"

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 1024px)")
  return isMobile ? <HomeMobile /> : <HomeDesktop />
}
