import Eyebrow from './Eyebrow.jsx';
import Reveal, { stagger } from './Reveal.jsx';
import { AUDIENCES } from '../data.js';

export default function Audiences({ eyebrow = '03 — Para quem é' }) {
  return (
    <section className="section" aria-labelledby="audiences-title">
      <div className="wrap">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.08} duration={0.75}>
          <h2 className="h2 h2--sm" id="audiences-title">
            Para quem quer estar preparado para a próxima geração da indústria automotiva.
          </h2>
        </Reveal>

        <div className="audiences">
          {AUDIENCES.map(({ n, title, desc }, i) => (
            <Reveal key={n} delay={stagger(i)}>
              <article className="audience">
                <p className="audience__badge">{n}</p>
                <h3 className="audience__title">{title}</h3>
                <p className="audience__desc">{desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
