import Eyebrow from './Eyebrow.jsx';
import { REASONS } from '../data.js';

import carTrack from '../assets/car-track.png';

export default function WhyUs() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="split split--head">
          <div>
            <Eyebrow>04 — Por que aprender conosco</Eyebrow>
            <h2 className="h2">Mais do que conteúdo. Experiência de indústria.</h2>
          </div>
          <p className="split__body">
            Não acreditamos em treinamento baseado apenas em teoria. Nosso objetivo é conectar
            conhecimento técnico à realidade de quem desenvolve, testa e valida tecnologias
            automotivas.
          </p>
        </div>

        <div className="reasons">
          {REASONS.map(({ title, desc }) => (
            <article className="reason" key={title}>
              <h3 className="reason__title">{title}</h3>
              <p className="reason__desc">{desc}</p>
            </article>
          ))}
        </div>

        <div className="claim">
          <div className="claim__text">
            <p>
              Porque conhecer a tecnologia é apenas o começo. Entender como ela chega ao veículo é o
              verdadeiro diferencial.
            </p>
          </div>
          <figure className="claim__media">
            <img
              src={carTrack}
              alt="Veículo em pista de testes"
              width={1448}
              height={1086}
              loading="lazy"
              decoding="async"
            />
            <div className="claim__scrim" aria-hidden="true" />
            <figcaption>Testes e validação</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
