import logo from '../assets/logo-couts.jpg';

/**
 * A arte do logo é uma imagem quadrada sobre fundo preto. O recorte fica no
 * CSS: o elemento pai (`.logo.logo--header` / `.logo--footer`) define a janela
 * e `mix-blend-mode: lighten` faz o preto desaparecer.
 */
export default function Logo() {
  return <img src={logo} alt="COUTS" />;
}
