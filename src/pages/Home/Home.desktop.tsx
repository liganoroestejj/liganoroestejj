import Header from "../../components/home/Header/Header.desktop"
import Hero from "../../components/home/Hero/Hero.desktop"
import StatsBar from "../../components/home/StatsBar/StatsBar.desktop"
import EventsSection from "../../components/home/EventsSection/EventsSection.desktop"
import FeaturesSection from "../../components/home/FeaturesSection/FeaturesSection.desktop"
import AboutSection from "../../components/home/AboutSection/AboutSection.desktop"
import MembershipSection from "../../components/home/MembershipSection/MembershipSection.desktop"
import FaqSection from "../../components/home/FaqSection/FaqSection.desktop"
import NewsSection from "../../components/home/NewsSection/NewsSection.desktop"
import Footer from "../../components/home/Footer/Footer.desktop"

export default function HomeDesktop() {
  return (
    <main>
      <Header />
      <Hero />
      <StatsBar />
      <EventsSection />
      <FeaturesSection />
      <AboutSection />
      <MembershipSection />
      <FaqSection />
      <NewsSection />
      <Footer />
    </main>
  )
}
