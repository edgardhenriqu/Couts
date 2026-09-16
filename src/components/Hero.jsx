import Eyebrow from './Eyebrow.jsx';
import useBackgroundVideo from '../hooks/useBackgroundVideo.js';
import { HERO_DIM_PERCENT, VIDEO_SPEED } from '../config.js';

import heroVideo from '../assets/hero-car.mp4';
import heroPoster from '../assets/car-mountain.png';

export default function Hero() {
  const videoRef = useBackgroundVideo(VIDEO_SPEED);

  return (
    <section className="hero" id="hero" style={{ '--hero-dim': HERO_DIM_PERCENT / 100 }}>
      <video
        ref={videoRef}
        className="hero__video"
        src={heroVideo}
        poster={heroPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="hero__scrim hero__scrim--x" aria-hidden="true" />
      <div className="hero__scrim hero__scrim--y" aria-hidden="true" />
      <div className="hero__dim" aria-hidden="true" />

      <div className="hero__inner">
        <Eyebrow glow>Learn. Connect. Build.</Eyebrow>

        <h1 className="hero__title">Aprenda com quem vive a tecnologia automotiva na prática.</h1>

        <p className="hero__tagline">A nova engenharia exige novas competências.</p>

        <p className="hero__lede">
          “Treinamentos técnicos em tecnologias automotivas, desenvolvidos a partir de experiências reais em desenvolvimento, testes e validação na indústria global.”
        </p>

        <div className="hero__actions">
          <a className="btn btn--primary" href="#treinamentos">
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
