import { Children, cloneElement } from 'react';

/**
 * Revela o elemento filho ao entrar na tela (fade + deslocamento discreto).
 *
 * Não cria wrapper: só acrescenta `data-reveal` e variáveis CSS ao próprio
 * filho, então grids, flex e seletores existentes continuam iguais. O filho
 * precisa ser um elemento DOM (ou um componente que repasse `data-*` e
 * `style`). Quem observa e dispara é `useScrollReveal` (em App.jsx); o visual
 * fica em styles.css ("scroll reveal").
 *
 * - direction: lado de onde o elemento vem — 'up' (de baixo para cima),
 *   'down', 'left', 'right' ou 'none' (só fade). No celular, 'left'/'right'
 *   viram 'up' para não gerar rolagem horizontal.
 * - delay / duration: em segundos.
 * - distance: deslocamento em px (padrão 30).
 * - scale: escala inicial, ex.: 0.97 para imagens.
 * - once: anima só na primeira vez (padrão). Com `false`, some ao sair da tela.
 *
 *   <Reveal><h2>Título</h2></Reveal>
 *   <Reveal direction="right" delay={0.15} scale={0.97}><img … /></Reveal>
 */
export default function Reveal({ children, direction = 'up', delay, duration, distance, scale, once = true }) {
  const child = Children.only(children);

  const vars = {};
  if (delay) vars['--reveal-delay'] = `${delay}s`;
  if (duration) vars['--reveal-duration'] = `${duration}s`;
  if (distance !== undefined) vars['--reveal-distance'] = `${distance}px`;
  if (scale !== undefined) vars['--reveal-scale'] = scale;

  return cloneElement(child, {
    'data-reveal': direction,
    'data-reveal-once': once ? undefined : 'false',
    style: { ...child.props.style, ...vars },
  });
}

/** Atraso do item `index` numa sequência (cards lado a lado), em segundos. */
export const stagger = (index, step = 0.1, start = 0) => start + index * step;
