import SiteHeader from './components/SiteHeader.jsx';
import Hero from './components/Hero.jsx';
import Pillars from './components/Pillars.jsx';
import MarketSection from './components/MarketSection.jsx';
import QuoteBand from './components/QuoteBand.jsx';
import Trainings from './components/Trainings.jsx';
import Audiences from './components/Audiences.jsx';
import LearnConnectBuild from './components/LearnConnectBuild.jsx';
import WhyUs from './components/WhyUs.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import SiteFooter from './components/SiteFooter.jsx';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#hero">
        Ir para o conteúdo
      </a>

      <SiteHeader />

      <main>
        <Hero />
        <Pillars />
        <MarketSection />
        <QuoteBand />
        <Trainings />
        <Audiences />
        <LearnConnectBuild />
        <WhyUs />
        <About />
        <Contact />
      </main>

      <SiteFooter />
    </>
  );
}
