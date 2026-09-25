import Eyebrow from './Eyebrow.jsx';
import { AUDIENCES } from '../data.js';

export default function Audiences({ eyebrow = '03 — Para quem é' }) {
  return (
    <section className="section" aria-labelledby="audiences-title">
      <div className="wrap">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="h2 h2--sm" id="audiences-title">
          Para quem quer estar preparado para a próxima geração da indústria automotiva.
        </h2>

        <div className="audiences">
          {AUDIENCES.map(({ n, title, desc }) => (
            <article className="audience" key={n}>
              <p className="audience__badge">{n}</p>
              <h3 className="audience__title">{title}</h3>
              <p className="audience__desc">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
