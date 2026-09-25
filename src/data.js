/**
 * Conteúdo da landing page, extraído do design `COUTS Landing.dc.html`.
 * Mantido fora dos componentes para que texto e markup evoluam separados.
 */

import bannerAdas from './assets/treinamento-adas-1672.webp';
import bannerAdasSm from './assets/treinamento-adas-836.webp';
import bannerDiagnostico from './assets/treinamento-diagnostico-1672.webp';
import bannerDiagnosticoSm from './assets/treinamento-diagnostico-836.webp';
import bannerEletronica from './assets/treinamento-eletronica-1672.webp';
import bannerEletronicaSm from './assets/treinamento-eletronica-836.webp';
import bannerArquitetura from './assets/treinamento-arquitetura-1672.webp';
import bannerArquiteturaSm from './assets/treinamento-arquitetura-836.webp';

/** Proporção nativa dos banners de curso (1672 × 941). */
export const BANNER_SIZE = { width: 1672, height: 941 };

/** `srcset` dos banners: 836 px para celular/painel, 1672 px para telas densas. */
const bannerSet = (small, large) => `${small} 836w, ${large} 1672w`;

/** Numera os tópicos como "01", "02", … igual ao design. */
const numbered = (labels) =>
  labels.map((label, i) => ({ n: String(i + 1).padStart(2, '0'), label }));

export const TECHS = [
  {
    code: '01',
    short: 'ADAS',
    title: 'ADAS: Sistemas Avançados de Assistência ao Motorista',
    slug: 'adas',
    banner: bannerAdas,
    bannerSrcSet: bannerSet(bannerAdasSm, bannerAdas),
    bannerAlt:
      'Arte do treinamento de ADAS: SUV em um galpão com feixes de sensores detectando um pedestre e outro veículo.',
    seoTitle: 'Treinamento em ADAS: sensores, fusão e validação | COUTS',
    seoDescription:
      'Treinamento em ADAS da COUTS: funções ACC, AEB e LKA, câmera, radar, fusão de sensores, arquitetura, desenvolvimento e validação de sistemas de assistência.',
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
    slug: 'diagnostico-automotivo',
    banner: bannerDiagnostico,
    bannerSrcSet: bannerSet(bannerDiagnosticoSm, bannerDiagnostico),
    bannerAlt:
      'Arte do treinamento de Diagnóstico Automotivo: carro com o capô aberto em uma oficina e um técnico usando um scanner de diagnóstico.',
    seoTitle: 'Treinamento em Diagnóstico Automotivo: ECUs e CAN | COUTS',
    seoDescription:
      'Treinamento em diagnóstico automotivo: ECUs e módulos, leitura de falhas, sensores e atuadores, rede CAN, interpretação de dados e diagnóstico sistemático.',
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
    slug: 'eletronica-automotiva',
    banner: bannerEletronica,
    bannerSrcSet: bannerSet(bannerEletronicaSm, bannerEletronica),
    bannerAlt:
      'Arte do treinamento de Eletrônica Automotiva: SUV com os módulos eletrônicos e o chicote destacados em azul sobre a carroceria.',
    seoTitle: 'Treinamento em Eletrônica Automotiva: ECUs e CAN/LIN | COUTS',
    seoDescription:
      'Treinamento em eletrônica automotiva: sensores, ECUs, microcontroladores, atuadores, alimentação, comunicação CAN/LIN e interação entre os módulos do veículo.',
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
    slug: 'arquitetura-eletronica-veicular',
    banner: bannerArquitetura,
    bannerSrcSet: bannerSet(bannerArquiteturaSm, bannerArquitetura),
    bannerAlt:
      'Arte do treinamento de Arquitetura Eletrônica do Veículo: sedã com as redes CAN, LIN e Ethernet e os módulos destacados, ao lado de um painel de arquitetura zonal.',
    seoTitle: 'Treinamento em Arquitetura Eletrônica Veicular (E/E) | COUTS',
    seoDescription:
      'Treinamento em arquitetura E/E: ECUs, redes CAN, LIN e Ethernet, gateways, domain controllers, arquitetura zonal e software-defined vehicle.',
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

/** URL permanente da página de cada treinamento. */
export const trainingPath = (tech) => `/treinamentos/${tech.slug}`;

export const PILLARS = [
  { code: '01', title: 'ADAS', note: 'Sensores, fusão e validação de funções de assistência.' },
  { code: '02', title: 'Diagnóstico', note: 'ECUs, falhas, CAN e método sistemático.' },
  { code: '03', title: 'Eletrônica', note: 'ECUs, sensores, atuadores e comunicação.' },
  { code: '04', title: 'Arquitetura E/E', note: 'Redes, gateways e software-defined vehicle.' },
].map((pillar, i) => ({ ...pillar, href: trainingPath(TECHS[i]) }));

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


/**
 * Links absolutos (`/#…`): funcionam na página inicial (rolagem na mesma
 * página) e nas páginas de treinamento (voltam para a seção da inicial).
 */
export const NAV_LINKS = [
  { href: '/#treinamentos', label: 'Treinamentos' },
  { href: '/#tecnologias', label: 'Tecnologias' },
  { href: '/#professores', label: 'Instrutores' },
];

export const COMPANY_OPTION = 'Capacitação para empresa ou equipe';

export const TRAINING_OPTIONS = [...TECHS.map((tech) => tech.short), COMPANY_OPTION, 'Outro'];

/**
 * Perguntas frequentes. Cada resposta usa apenas o que o site já afirma
 * (treinamentos, conteúdo, público e experiência). Formato, carga horária,
 * datas, valores e certificado não foram informados e por isso não aparecem.
 */
export const FAQ = [
  {
    q: 'Quais treinamentos a COUTS oferece?',
    a: 'Quatro treinamentos técnicos em tecnologias automotivas: ADAS (Sistemas Avançados de Assistência ao Motorista), Diagnóstico Automotivo, Eletrônica Automotiva e Arquitetura Eletrônica do Veículo.',
  },
  {
    q: 'Para quem são os treinamentos?',
    a: 'Para estudantes de engenharia, engenheiros recém-formados, engenheiros e profissionais do setor, mecânicos e técnicos automotivos, e empresas e equipes técnicas que precisam desenvolver competências específicas da indústria automotiva.',
  },
  {
    q: 'A COUTS atende empresas e equipes técnicas?',
    a: 'Sim. Empresas e equipes técnicas estão entre o público dos treinamentos, com foco em competências específicas para os desafios tecnológicos da indústria automotiva. Para conversar sobre a sua equipe, use o formulário de contato e escolha “Capacitação para empresa ou equipe”.',
  },
  {
    q: 'Qual é a experiência por trás dos treinamentos?',
    a: 'Os treinamentos são desenvolvidos a partir de experiências reais em desenvolvimento, testes e validação na indústria automotiva. Felipe Coutinho, que está por trás da COUTS, tem mais de 10 anos de experiência em tecnologia e engenharia automotiva, no Brasil e na Europa, com atuação em ADAS, eletrônica automotiva, diagnóstico, infotainment e redes veiculares.',
  },
  {
    q: 'Como recebo informações sobre as próximas turmas?',
    a: 'Preencha o formulário de contato com o seu nome, e-mail e o treinamento de interesse. A equipe da COUTS retorna com as próximas turmas e conteúdos.',
  },
];
