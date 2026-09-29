import Reveal from './Reveal.jsx';

import carMountain from '../assets/carro-estrada-montanha-1448.webp';
import carMountainSm from '../assets/carro-estrada-montanha-800.webp';

export default function QuoteBand() {
  return (
    <section className="band" aria-label="Software, eletrônica e dados">
      {/* Imagem de fundo sangrada: só fade, para não descobrir as bordas da faixa. */}
      <Reveal direction="none" duration={1.1}>
        <img
          className="band__img"
          src={carMountain}
          srcSet={`${carMountainSm} 800w, ${carMountain} 1448w`}
          sizes="100vw"
          alt="Carro esportivo escuro em uma estrada de montanha ao pôr do sol"
          width={1448}
          height={1086}
          loading="lazy"
          decoding="async"
        />
      </Reveal>
      <div className="band__scrim" aria-hidden="true" />
      <div className="band__inner">
        <div className="wrap">
          <Reveal delay={0.2} duration={0.8}>
            <p className="band__quote">
              Software, eletrônica e dados definem o veículo antes da primeira volta de roda.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
