/**
 * Conteúdo do bloco 5, “Quem está por trás”.
 *
 * Fonte: documento “Update estrutura LP”, vídeo de orientação e arte de
 * referência (`ChatGPT Image 16 de set. de 2026, 16_16_29.png`, 1672 × 941)
 * enviados pelo usuário em 16/09/2026.
 *
 * `felipe-industria-automotiva.webp` é a área da foto dessa arte (a partir de
 * x = 600 px), com o vermelho trocado pelo azul do site e sem os restos do
 * texto da coluna esquerda. “Indústria automotiva” e “Tecnologia • Pessoas •
 * Mobilidade” fazem parte da imagem.
 *
 * Os `\n` repetem as quebras de linha da arte no desktop; abaixo de 1100px
 * viram espaço e o texto quebra normalmente. “Mercedes‑Benz” usa hífen não
 * separável (U+2011) para o nome não quebrar no meio.
 */
import photo from './assets/felipe-industria-automotiva.webp';

export const FELIPE = {
  photo,
  photoAlt:
    'Felipe Coutinho de terno em um corredor com luzes azuis e um carro ao fundo, com os dizeres “Indústria automotiva: tecnologia, pessoas, mobilidade”.',
  intro:
    'Profissional com sólida trajetória em tecnologia\ne engenharia automotiva, com atuação em projetos\nnacionais e internacionais e ampla vivência em\nsistemas, validação e diagnóstico veicular.',
  highlights: [
    '10+ anos de experiência em tecnologia\ne engenharia automotiva',
    'Experiência profissional no Brasil e na Europa',
    'Atuação em projetos envolvendo TEXA,\nVolkswagen, Stellantis, Continental,\nMercedes‑Benz, Porsche, Tesla e Murata',
    'Experiência em ADAS, Autopilot, eletrônica\nautomotiva, diagnóstico, infotainment e\nredes veiculares',
    'Atuação em desenvolvimento, testes,\nvalidação e análise de sistemas automotivos',
    'Experiência prática com ECUs, sensores,\nradares, câmeras, CAN e protocolos\nde diagnóstico',
    'Vivência em diferentes etapas da cadeia\nautomotiva — do componente e diagnóstico\nà integração e validação no veículo',
  ],
};
