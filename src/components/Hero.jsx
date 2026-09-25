import Eyebrow from './Eyebrow.jsx';
import useBackgroundVideo from '../hooks/useBackgroundVideo.js';
import { HERO_DIM_PERCENT, VIDEO_SPEED } from '../config.js';

import heroVideo from '../assets/hero-carro-720.mp4';
import heroVideoMobile from '../assets/hero-carro-360.mp4';
import heroPoster from '../assets/carro-estrada-montanha-1448.webp';

/** O pôster é o maior elemento da primeira dobra (LCP): a página o pré-carrega. */
export const HERO_POSTER = heroPoster;

export default function Hero() {
  const videoRef = useBackgroundVideo(VIDEO_SPEED);

  return (
    <section className="hero" id="hero" aria-labelledby="hero-title" style={{ '--hero-dim': HERO_DIM_PERCENT / 100 }}>
      <video
        ref={videoRef}
        className="hero__video"
        poster={heroPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      >
        {/* Celular recebe a versão 640 × 360 (~0,6 MB) em vez da 1280 × 720. */}
        <source src={heroVideoMobile} type="video/mp4" media="(max-width: 760px)" />
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="hero__scrim hero__scrim--x" aria-hidden="true" />
      <div className="hero__scrim hero__scrim--y" aria-hidden="true" />
      <div className="hero__dim" aria-hidden="true" />

      <div className="hero__inner">
        <Eyebrow glow>Learn. Connect. Build.</Eyebrow>

        <h1 className="hero__title" id="hero-title">Aprenda com quem vive a tecnologia automotiva na prática.</h1>

        <p className="hero__tagline">A nova engenharia exige novas competências.</p>

        <p className="hero__lede">
          “Treinamentos técnicos em tecnologias automotivas, desenvolvidos a partir de experiências reais em desenvolvimento, testes e validação na indústria global.”
        </p>

        <div className="hero__actions">
          <a className="btn btn--primary" href="#treinamentos" data-track="cta_click">
            Quero conhecer os treinamentos{' '}
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
