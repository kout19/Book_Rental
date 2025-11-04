import LandingHeader from '../components/layout/LandingHeader'
import HeroSection from '../components/common/HeroSection'
import FeatureSection from '../components/common/FeatureSection'
import FAQSection from '../components/common/FAQSection'
import ContactSection from '../components/common/ContactSection'
import LandingFooter from '../components/layout/LandignFooter'
export default function Landing() {
  return (
    <>
      <LandingHeader />
      <HeroSection />
      <FeatureSection />
      <FAQSection />
      <section id='contact'>
       <ContactSection />
      </section>
      <LandingFooter />
    </>
  )
}
