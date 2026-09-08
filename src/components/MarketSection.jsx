import Eyebrow from './Eyebrow.jsx';
import { MARKET_PARAGRAPHS, MARKET_PULL } from '../data.js';

export default function MarketSection() {
  return (
    <section className="section section--split">
      <div>
        <Eyebrow>01 — Contexto</Eyebrow>
        <h2 className="h2">O mercado está mudando</h2>
      </div>

      <div className="prose">
        {MARKET_PARAGRAPHS.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <p className="prose__pull">{MARKET_PULL}</p>
      </div>
    </section>
  );
}
