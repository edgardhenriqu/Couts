/**
 * Conteúdo da landing page, extraído do design `COUTS Landing.dc.html`.
 * Mantido fora dos componentes para que texto e markup evoluam separados.
 */

import bannerAdas from './assets/curso-adas.png';
import bannerDiagnostico from './assets/curso-diagnostico.png';
import bannerEletronica from './assets/curso-eletronica.png';
import bannerArquitetura from './assets/curso-arquitetura.png';

/** Proporção nativa dos banners de curso (1672 × 941). */
export const BANNER_SIZE = { width: 1672, height: 941 };

/** Numera os tópicos como "01", "02", … igual ao design. */
const numbered = (labels) =>
  labels.map((label, i) => ({ n: String(i + 1).padStart(2, '0'), label }));

export const TECHS = [
  {
    code: '01',
    short: 'ADAS',
    title: 'ADAS: Sistemas Avançados de Assistência ao Motorista',
    banner: bannerAdas,
    desc: 'Do sensor à função no veículo: como os sistemas de assistência são arquitetados, desenvolvidos e validados.',
    topics: numbered([
      'o que é ADAS',
      'principais funções: ACC, AEB, LKA etc.',
      'sensores e suas funções',
      'câmera, radar e outros sensores',
      'fusão de sensores',
      'arquitetura dos sistemas',
      'desenvolvimento e validação',
      'exemplos de aplicação no veículo',
    ]),
  },
  {
    code: '02',
    short: 'Diagnóstico Automotivo',
    title: 'Diagnóstico Automotivo',
    banner: bannerDiagnostico,
    desc: 'Leitura, interpretação e método: como investigar falhas de forma sistemática em veículos modernos.',
    topics: numbered([
      'ECU/módulos',
      'leitura de falhas',
      'sensores e atuadores',
      'comunicação entre módulos',
      'CAN',
      'interpretação de dados',
      'diagnóstico sistemático',
      'ferramentas de diagnóstico',
    ]),
  },
  {
    code: '03',
    short: 'Eletrônica Automotiva',
    title: 'Eletrônica Automotiva: ECUs, Sensores e Atuadores',
    banner: bannerEletronica,
    desc: 'A base eletrônica do veículo e como os módulos conversam entre si.',
    topics: numbered([
      'sensores',
      'ECUs',
      'microcontroladores',
      'atuadores',
      'alimentação',
      'comunicação',
      'CAN/LIN',
      'diagnóstico',
      'funções dos módulos',
      'interação entre módulos',
    ]),
  },
  {
    code: '04',
    short: 'Arquitetura Eletrônica',
    title: 'Arquitetura Eletrônica do Veículo',
    banner: bannerArquitetura,
    desc: 'Da arquitetura distribuída ao software-defined vehicle: como a topologia elétrica e eletrônica está evoluindo.',
    topics: numbered([
      'visão geral da arquitetura E/E',
      'módulos e ECUs',
      'redes automotivas',
      'CAN, LIN, Ethernet',
      'gateways',
      'sensores e atuadores',
      'domain controllers',
      'zonal architecture',
      'distribuição de energia',
      'evolução da arquitetura',
      'software-defined vehicle',
    ]),
  },
];

export const PILLARS = [
  { code: '01', title: 'ADAS', note: 'Sensores, fusão e validação de funções de assistência.' },
  { code: '02', title: 'Diagnóstico', note: 'ECUs, falhas, CAN e método sistemático.' },
  { code: '03', title: 'Eletrônica', note: 'ECUs, sensores, atuadores e comunicação.' },
  { code: '04', title: 'Arquitetura E/E', note: 'Redes, gateways e software-defined vehicle.' },
];

export const MARKET_PARAGRAPHS = [
  'O setor automotivo está passando por uma das maiores transformações de sua história.',
  'Veículos modernos combinam software, eletrônica, sensores, conectividade, inteligência de dados e sistemas avançados de assistência ao motorista.',
  'Com essa transformação, surgem novas tecnologias, novas funções e, principalmente, novas competências para quem quer trabalhar na indústria.',
];

export const MARKET_PULL =
  'A formação tradicional é importante. Mas, para entender como essas tecnologias realmente chegam ao veículo, é preciso conhecer a realidade da indústria.';

export const AUDIENCES = [
  {
    n: 'A',
    title: 'Estudantes de Engenharia',
    desc: 'Vá além da teoria e comece a entender como a engenharia é aplicada na indústria automotiva.',
  },
  {
    n: 'B',
    title: 'Engenheiros Recém-formados',
    desc: 'Desenvolva competências técnicas e uma visão prática para se destacar no início da sua carreira.',
  },
  {
    n: 'C',
    title: 'Engenheiros e Profissionais',
    desc: 'Aprofunde seus conhecimentos e acompanhe as tecnologias que estão transformando o setor.',
  },
  {
    n: 'D',
    title: 'Empresas e Equipes Técnicas',
    desc: 'Desenvolva competências específicas para os desafios tecnológicos da indústria automotiva.',
  },
  {
    n: 'E',
    title: 'Mecânicos e Técnicos Automotivos',
    desc: 'Evolua junto com os veículos. Aprofunde seus conhecimentos em eletrônica, diagnóstico, redes, sensores e sistemas cada vez mais presentes na reparação automotiva.',
  },
];

export const LCB = [
  { word: 'Learn', desc: 'Aprender tecnologias automotivas com profissionais que têm experiência prática.' },
  { word: 'Connect', desc: 'Conectar-se com profissionais, especialistas e empresas do ecossistema.' },
  { word: 'Build', desc: 'Transformar conhecimento em projetos, produtos e soluções de engenharia.' },
];

export const REASONS = [
  {
    title: 'Experiência prática',
    desc: 'Aprenda com profissionais que tiveram contato direto com projetos e tecnologias automotivas reais.',
  },
  {
    title: 'Visão de indústria',
    desc: 'Entenda não apenas como uma tecnologia funciona, mas como ela é desenvolvida, integrada, testada e validada.',
  },
  {
    title: 'Conexão com o ecossistema',
    desc: 'Faça parte de uma comunidade construída para aproximar profissionais, conhecimento e oportunidades dentro da indústria automotiva.',
  },
];

export const NAV_LINKS = [
  { href: '#treinamentos', label: 'Treinamentos' },
  { href: '#por-que-aprender-conosco', label: 'Tecnologias' },
  { href: '#professores', label: 'Instrutores' },
];

export const SOCIALS = ['WhatsApp', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok'];

export const TRAINING_OPTIONS = [
  'ADAS',
  'Diagnóstico Automotivo',
  'Eletrônica Automotiva',
  'Arquitetura Eletrônica',
  'Outro',
];
