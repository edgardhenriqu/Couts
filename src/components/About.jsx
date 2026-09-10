import Eyebrow from './Eyebrow.jsx';
import { ABOUT_PARAGRAPHS } from '../data.js';

import carCity from '../assets/car-city.png';

export default function About() {
  return (
    <section className="section section--alt" id="quem-somos">
      <div className="wrap split split--center">
        <div>
          <Eyebrow>05 — Quem somos</Eyebrow>
          <h2 className="h2 h2--tight">Experiência construída dentro da indústria automotiva</h2>

          <div className="prose">
            {ABOUT_PARAGRAPHS.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
          <a className="about-teachers-link" href="#professores">
            Conheça nossos professores <span aria-hidden="true">→</span>
          </a>
        </div>

        <figure className="framed">
          <img
            src={carCity}
            alt="Veículo em ambiente urbano"
            width={1448}
            height={1086}
            loading="lazy"
            decoding="async"
          />
          <div className="framed__scrim" aria-hidden="true" />
          <figcaption className="framed__caption">
            <span>ADAS · E/E · Sensores · Semicondutores</span>
            <span className="framed__mark">COUTS</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
