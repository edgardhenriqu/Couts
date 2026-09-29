import { useEffect } from 'react';

/** Fração do elemento (ou da tela, se ele for mais alto que ela) visível para revelar. */
const THRESHOLD = 0.2;

/**
 * Observa todos os `[data-reveal]` da página (ver `components/Reveal.jsx`) com
 * um único IntersectionObserver — nenhum listener de scroll.
 *
 * Estados em `data-revealed`: ausente (oculto) → 'in' (transição de entrada
 * rodando) → 'done'. A transição de entrada só vale no estado 'in'; em 'done'
 * o elemento volta às próprias transições (hover dos botões e cards).
 *
 * Só age se o script do index.html ligou a classe `reveal-on` no <html> (há
 * IntersectionObserver e o usuário não pediu movimento reduzido). Sem JS, ou
 * se o bundle demorar, a classe não existe ou é retirada e tudo fica visível.
 */
export default function useScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    window.__coutsReveal = true;
    if (!root.classList.contains('reveal-on')) return undefined;

    const timers = new Set();

    const finish = (el) => {
      el.dataset.revealed = 'done';
    };

    const show = (el) => {
      el.dataset.revealed = 'in';
      const onEnd = (event) => {
        if (event.target !== el || event.propertyName !== 'opacity') return;
        el.removeEventListener('transitionend', onEnd);
        finish(el);
      };
      el.addEventListener('transitionend', onEnd);
      // Garantia caso o `transitionend` não chegue (aba em segundo plano etc.).
      const timer = setTimeout(() => {
        timers.delete(timer);
        el.removeEventListener('transitionend', onEnd);
        if (el.dataset.revealed === 'in') finish(el);
      }, 2500);
      timers.add(timer);
    };

    let first = true;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target;
          const once = el.dataset.revealOnce !== 'false';
          const { intersectionRect, rootBounds, boundingClientRect } = entry;
          const visible =
            entry.isIntersecting &&
            (entry.intersectionRatio >= THRESHOLD ||
              (rootBounds && intersectionRect.height >= rootBounds.height * THRESHOLD));

          if (visible) {
            if (!el.dataset.revealed) show(el);
            if (once) observer.unobserve(el);
          } else if (first && boundingClientRect.bottom <= 0) {
            // Página aberta já rolada (âncora, recarga): o que ficou acima
            // aparece direto, sem esperar o usuário voltar.
            finish(el);
            if (once) observer.unobserve(el);
          } else if (!once && !entry.isIntersecting && el.dataset.revealed) {
            delete el.dataset.revealed;
          }
        }
        first = false;
      },
      { threshold: [0, THRESHOLD, 0.5, 1] },
    );

    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);
}
