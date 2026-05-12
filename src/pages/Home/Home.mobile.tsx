import Header from "../../components/home/Header/Header.mobile"
import Hero from "../../components/home/Hero/Hero.mobile"
import StatsBar from "../../components/home/StatsBar/StatsBar.mobile"
import EventsSection from "../../components/home/EventsSection/EventsSection.mobile"
import FeaturesSection from "../../components/home/FeaturesSection/FeaturesSection.mobile"
import AboutSection from "../../components/home/AboutSection/AboutSection.mobile"
import MembershipSection from "../../components/home/MembershipSection/MembershipSection.mobile"
import FaqSection from "../../components/home/FaqSection/FaqSection.mobile"
import NewsSection from "../../components/home/NewsSection/NewsSection.mobile"
import Footer from "../../components/home/Footer/Footer.mobile"

export default function HomeMobile() {
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
