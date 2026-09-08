import { useRef, useState } from 'react';

import Eyebrow from './Eyebrow.jsx';
import { BANNER_SIZE, TECHS } from '../data.js';

export default function Trainings() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);

  const focusTab = (index) => {
    setActive(index);
    tabRefs.current[index]?.focus();
  };

  // Navegação por teclado conforme o padrão ARIA de tabs.
  const onKeyDown = (event) => {
    const last = TECHS.length - 1;
    const moves = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowDown: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      ArrowUp: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };

    const next = moves[event.key];
    if (next === undefined) return;

    event.preventDefault();
    focusTab(next);
  };

  const tech = TECHS[active];

  return (
    <section className="section section--alt" id="tecnologias">
      <div className="wrap">
        <Eyebrow>02 — Treinamentos</Eyebrow>
        <h2 className="h2 h2--narrow">Conhecimento técnico aplicado à realidade automotiva</h2>
        <p className="section__lede">
          Aprenda os fundamentos e aplicações das tecnologias que estão transformando o
          desenvolvimento dos veículos.
        </p>

        <div className="techs">
          <div className="techs__tablist" role="tablist" aria-label="Tecnologias" onKeyDown={onKeyDown}>
            {TECHS.map(({ code, short }, i) => (
              <button
                key={code}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                className={i === active ? 'tech-tab is-active' : 'tech-tab'}
                type="button"
                role="tab"
                id={`tab-${code}`}
                aria-controls={`panel-${code}`}
                aria-selected={i === active}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
              >
                <span className="tech-tab__code">{code}</span>
                <span className="tech-tab__short">{short}</span>
              </button>
            ))}
          </div>

          <div
            className="tech-panel"
            role="tabpanel"
            id={`panel-${tech.code}`}
            aria-labelledby={`tab-${tech.code}`}
            tabIndex={0}
          >
            {/*
              O banner do curso já traz título e descrição na própria arte. Em
              telas largas esse par fica só para leitores de tela e indexação
              (ver `.tech-panel__heading`); em telas estreitas, onde o texto da
              imagem fica pequeno demais, ele reaparece como texto de verdade.
              A imagem entra como decorativa para não duplicar a leitura.
            */}
            <div className="tech-panel__heading">
              <h3 className="tech-panel__title">{tech.title}</h3>
              <p className="tech-panel__desc">{tech.desc}</p>
            </div>

            <figure className="tech-panel__banner">
              <img
                src={tech.banner}
                alt=""
                width={BANNER_SIZE.width}
                height={BANNER_SIZE.height}
                loading="lazy"
                decoding="async"
              />
            </figure>

            <ol className="topics">
              {tech.topics.map(({ n, label }) => (
                <li key={n}>
                  <span className="topics__n">{n}</span>
                  <span className="topics__label">{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
