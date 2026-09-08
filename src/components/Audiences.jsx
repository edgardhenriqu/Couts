import Eyebrow from './Eyebrow.jsx';
import { AUDIENCES } from '../data.js';

export default function Audiences() {
  return (
    <section className="section">
      <div className="wrap">
        <Eyebrow>03 — Para quem é</Eyebrow>
        <h2 className="h2 h2--sm">
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
