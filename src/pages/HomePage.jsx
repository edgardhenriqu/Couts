import Hero from '../components/Hero.jsx';
import Pillars from '../components/Pillars.jsx';
import MarketSection from '../components/MarketSection.jsx';
import QuoteBand from '../components/QuoteBand.jsx';
import Trainings from '../components/Trainings.jsx';
import Audiences from '../components/Audiences.jsx';
import LearnConnectBuild from '../components/LearnConnectBuild.jsx';
import WhyUs from '../components/WhyUs.jsx';
import Teachers from '../components/Teachers.jsx';
import Faq from '../components/Faq.jsx';
import Contact from '../components/Contact.jsx';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Pillars />
      <MarketSection />
      <QuoteBand />
      <Trainings />
      <Audiences />
      <WhyUs />
      <Teachers />
      <Faq />
      <Contact />
      {/* Fechamento da página: Learn. Connect. Build. logo antes do rodapé. */}
      <LearnConnectBuild />
    </>
  );
}
