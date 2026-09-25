import logo from '../assets/logo-couts-512.webp';

/**
 * A arte do logo é uma imagem quadrada sobre fundo preto. O recorte fica no
 * CSS: o elemento pai (`.logo.logo--header` / `.logo--footer`) define a janela
 * e `mix-blend-mode: lighten` faz o preto desaparecer.
 *
 * 512 px cobrem as duas janelas em telas 2x (172 e 244 px de altura).
 */
export default function Logo({ alt = 'COUTS' }) {
  return <img src={logo} alt={alt} width={512} height={512} decoding="async" />;
}
