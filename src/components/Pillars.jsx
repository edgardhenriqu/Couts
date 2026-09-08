import { PILLARS } from '../data.js';

export default function Pillars() {
  return (
    <section className="pillars" id="treinamentos" aria-label="Áreas de treinamento">
      {PILLARS.map(({ code, title, note }) => (
        <article className="pillar" key={code}>
          <p className="pillar__code">{code}</p>
          <h2 className="pillar__title">{title}</h2>
          <p className="pillar__note">{note}</p>
        </article>
      ))}
    </section>
  );
}
