import carMountain from '../assets/carro-estrada-montanha-1448.webp';
import carMountainSm from '../assets/carro-estrada-montanha-800.webp';

export default function QuoteBand() {
  return (
    <section className="band" aria-label="Software, eletrônica e dados">
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
      <div className="band__scrim" aria-hidden="true" />
      <div className="band__inner">
        <div className="wrap">
          <p className="band__quote">
            Software, eletrônica e dados definem o veículo antes da primeira volta de roda.
          </p>
        </div>
      </div>
    </section>
  );
}
