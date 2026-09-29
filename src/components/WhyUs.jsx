import Eyebrow from './Eyebrow.jsx';
import Reveal, { stagger } from './Reveal.jsx';
import { REASONS } from '../data.js';

import carTrack from '../assets/carro-pista-testes-1448.webp';
import carTrackSm from '../assets/carro-pista-testes-800.webp';

export default function WhyUs() {
  return (
    <section className="section" id="por-que-aprender-conosco">
      <div className="wrap">
        <div className="split split--head">
          <Reveal direction="left" duration={0.75}>
            <div>
              <Eyebrow>04 — Por que aprender conosco</Eyebrow>
              <h2 className="h2">Mais do que conteúdo. Experiência de indústria.</h2>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.15}>
            <p className="split__body">
              Não acreditamos em treinamento baseado apenas em teoria. Nosso objetivo é conectar
              conhecimento técnico à realidade de quem desenvolve, testa e valida tecnologias
              automotivas.
            </p>
          </Reveal>
        </div>

        <div className="reasons">
          {REASONS.map(({ title, desc }, i) => (
            <Reveal key={title} delay={stagger(i)}>
              <article className="reason">
                <h3 className="reason__title">{title}</h3>
                <p className="reason__desc">{desc}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="claim">
          <Reveal direction="left">
            <div className="claim__text">
              <p>
                Porque conhecer a tecnologia é apenas o começo. Entender como ela chega ao veículo é o
                verdadeiro diferencial.
              </p>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.15} scale={0.97} duration={0.8}>
            <figure className="claim__media">
              <img
                src={carTrack}
                srcSet={`${carTrackSm} 800w, ${carTrack} 1448w`}
                sizes="(max-width: 1100px) 100vw, 600px"
                alt="Carro esportivo cinza parado nos boxes de uma pista de testes"
                width={1448}
                height={1086}
                loading="lazy"
                decoding="async"
              />
              <div className="claim__scrim" aria-hidden="true" />
              <figcaption>Testes e validação</figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
