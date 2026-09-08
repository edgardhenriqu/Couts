import carMountain from '../assets/car-mountain.png';

export default function QuoteBand() {
  return (
    <section className="band" aria-label="Software, eletrônica e dados">
      <img
        className="band__img"
        src={carMountain}
        alt="Veículo em estrada de montanha"
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
