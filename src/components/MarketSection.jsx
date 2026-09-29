import Eyebrow from './Eyebrow.jsx';
import Reveal, { stagger } from './Reveal.jsx';
import { MARKET_PARAGRAPHS, MARKET_PULL } from '../data.js';

export default function MarketSection() {
  return (
    <section className="section section--split">
      <Reveal direction="left" duration={0.75}>
        <div>
          <Eyebrow>01 — Contexto</Eyebrow>
          <h2 className="h2">O mercado está mudando</h2>
        </div>
      </Reveal>

      <div className="prose">
        {MARKET_PARAGRAPHS.map((text, i) => (
          <Reveal key={text} delay={stagger(i, 0.1, 0.15)}>
            <p>{text}</p>
          </Reveal>
        ))}
        <Reveal delay={stagger(MARKET_PARAGRAPHS.length, 0.1, 0.15)}>
          <p className="prose__pull">{MARKET_PULL}</p>
        </Reveal>
      </div>
    </section>
  );
}
