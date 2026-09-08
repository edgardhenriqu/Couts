import { useEffect, useRef } from 'react';

/**
 * Controla um vídeo decorativo de fundo:
 * - aplica a velocidade de reprodução;
 * - respeita `prefers-reduced-motion` (mantém o pôster parado);
 * - pausa quando o vídeo sai da viewport, para não gastar CPU/bateria.
 *
 * Retorna a ref que deve ir no `<video>`.
 */
export default function useBackgroundVideo(speed = 1) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // React aplica `muted` como propriedade, o que pode chegar depois de o
    // Chrome avaliar o autoplay. Sem a garantia de mudo o autoplay é bloqueado
    // e o Chrome adia o download do vídeo (fica em readyState 0 para sempre).
    video.defaultMuted = true;
    video.muted = true;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applySpeed = () => {
      video.playbackRate = speed;
    };

    // Autoplay pode ser bloqueado; a chamada explícita cobre esse caso.
    const play = () => {
      void video.play().catch(() => {
        /* sem autoplay o pôster assume */
      });
    };

    const sync = () => (reduceMotion.matches ? video.pause() : play());

    applySpeed();
    video.addEventListener('loadedmetadata', applySpeed);
    reduceMotion.addEventListener('change', sync);
    sync();

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (reduceMotion.matches) continue;
            if (entry.isIntersecting) play();
            else video.pause();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(video);
    }

    return () => {
      video.removeEventListener('loadedmetadata', applySpeed);
      reduceMotion.removeEventListener('change', sync);
      observer?.disconnect();
    };
  }, [speed]);

  return ref;
}
