import Reveal, { stagger } from './Reveal.jsx';
import { LCB } from '../data.js';

export default function LearnConnectBuild() {
  return (
    <section className="section section--alt lcb-section" aria-label="Learn. Connect. Build.">
      <div className="lcb-section__hairline" aria-hidden="true" />

      <div className="wrap">
        <div className="lcb">
          {LCB.map(({ word, desc }, i) => (
            <Reveal key={word} delay={stagger(i)}>
              <article className="lcb__cell">
                <p className="lcb__word">{word}</p>
                <p className="lcb__desc">{desc}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={stagger(LCB.length)}>
          <p className="lcb__flow">Treinamento → Networking → Engenharia</p>
        </Reveal>
      </div>
    </section>
  );
}
