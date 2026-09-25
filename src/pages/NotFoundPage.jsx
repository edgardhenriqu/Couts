import Eyebrow from '../components/Eyebrow.jsx';
import { TECHS, trainingHref } from '../data.js';

export default function NotFoundPage() {
  return (
    <section className="section not-found" aria-labelledby="not-found-title">
      <div className="wrap wrap--narrow">
        <Eyebrow>Erro 404</Eyebrow>
        <h1 className="h2 h2--tight" id="not-found-title">
          Página não encontrada
        </h1>
        <p className="section__lede">
          O endereço pode ter mudado ou não existir mais. Veja os treinamentos da COUTS ou volte
          para a página inicial.
        </p>
        <ul className="not-found__links">
          {TECHS.map((tech) => (
            <li key={tech.code}>
              <a className="text-link" href={trainingHref(tech)}>
                {tech.title} <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="hero__actions">
          <a className="btn btn--primary" href="/">
            Ir para a página inicial
          </a>
        </div>
      </div>
    </section>
  );
}
