import Eyebrow from '../components/Eyebrow.jsx';
import Audiences from '../components/Audiences.jsx';
import Contact from '../components/Contact.jsx';
import { BANNER_SIZE, REASONS, TECHS, trainingPath } from '../data.js';
import { FELIPE } from '../felipe.js';

/**
 * Página de um treinamento (`/treinamentos/<slug>`).
 *
 * Todo o conteúdo vem de `TECHS`, `REASONS`, `AUDIENCES` e `FELIPE`: nada aqui
 * é específico de SEO. Formato, carga horária, datas, valores e certificado
 * não foram informados e por isso não aparecem.
 */
export default function TrainingPage({ tech }) {
  const others = TECHS.filter((t) => t.slug !== tech.slug);

  return (
    <>
      <section className="section training-hero" aria-labelledby="training-title">
        <div className="wrap training-hero__grid">
          <div>
            <nav className="breadcrumb" aria-label="Trilha de navegação">
              <ol>
                <li>
                  <a href="/">Início</a>
                </li>
                <li>
                  <a href="/#treinamentos">Treinamentos</a>
                </li>
                <li aria-current="page">{tech.short}</li>
              </ol>
            </nav>

            <Eyebrow glow>Treinamento {tech.code}</Eyebrow>
            <h1 className="training-hero__title" id="training-title">
              {tech.title}
            </h1>
            <p className="hero__lede">{tech.desc}</p>

            <div className="hero__actions">
              <a className="btn btn--primary" href="#contato" data-track="contact_click" data-track-label={tech.short}>
                Fale com a COUTS{' '}
                <span className="btn__arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <a className="btn btn--ghost" href="#conteudo-programatico">
                Ver conteúdo programático
              </a>
            </div>
          </div>

          <figure className="tech-panel__banner training-hero__banner">
            <img
              src={tech.banner}
              srcSet={tech.bannerSrcSet}
              sizes="(max-width: 1100px) calc(100vw - 64px), 620px"
              alt={tech.bannerAlt}
              width={BANNER_SIZE.width}
              height={BANNER_SIZE.height}
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      <section className="section section--alt" id="conteudo-programatico" aria-labelledby="topics-title">
        <div className="wrap split">
          <div>
            <Eyebrow>01 — Conteúdo programático</Eyebrow>
            <h2 className="h2 h2--tight" id="topics-title">
              O que o treinamento de {tech.short} aborda
            </h2>
            <p className="split__body">
              Não acreditamos em treinamento baseado apenas em teoria. Nosso objetivo é conectar
              conhecimento técnico à realidade de quem desenvolve, testa e valida tecnologias
              automotivas.
            </p>
          </div>

          <ol className="topics">
            {tech.topics.map(({ n, label }) => (
              <li key={n}>
                <span className="topics__n">{n}</span>
                <span className="topics__label">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Audiences eyebrow="02 — Para quem é" />

      <section className="section section--alt" aria-labelledby="why-title">
        <div className="wrap">
          <Eyebrow>03 — Por que aprender conosco</Eyebrow>
          <h2 className="h2 h2--tight" id="why-title">
            Mais do que conteúdo. Experiência de indústria.
          </h2>

          <div className="reasons">
            {REASONS.map(({ title, desc }) => (
              <article className="reason" key={title}>
                <h3 className="reason__title">{title}</h3>
                <p className="reason__desc">{desc}</p>
              </article>
            ))}
          </div>

          <p className="training-founder">
            Por trás da COUTS está <strong>{FELIPE.name}</strong>, com mais de 10 anos de experiência
            em tecnologia e engenharia automotiva no Brasil e na Europa, em desenvolvimento, testes,
            validação e diagnóstico de sistemas automotivos.{' '}
            <a className="text-link" href="/#professores">
              Conheça a trajetória <span aria-hidden="true">→</span>
            </a>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="others-title">
        <div className="wrap">
          <Eyebrow>04 — Outros treinamentos</Eyebrow>
          <h2 className="h2 h2--tight" id="others-title">
            Continue explorando
          </h2>
          <div className="pillars pillars--others">
            {others.map((t) => (
              <article className="pillar" key={t.slug}>
                <p className="pillar__code">{t.code}</p>
                <h3 className="pillar__title">
                  <a className="pillar__link" href={trainingPath(t)} data-track="service_click" data-track-label={t.short}>
                    {t.short}
                  </a>
                </h3>
                <p className="pillar__note">{t.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Contact
        eyebrow="05 — Contato"
        title={`Quer levar o treinamento de ${tech.short} para você ou sua equipe?`}
        defaultInterest={tech.short}
      />
    </>
  );
}
