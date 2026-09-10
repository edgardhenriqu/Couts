/**
 * Fonte: perfil público indicado pelo usuário, consultado em 10/09/2026.
 * https://de.linkedin.com/in/felipe-coutinho-164906133/en
 * Formação, experiência e foto enviadas pelo usuário (capturas do LinkedIn).
 * Em `atuacao` ficam só as experiências mais recentes, para o cartão não crescer.
 * Não atribuir ao Felipe cargos de vagas que ele compartilhou no feed.
 */
import portrait from './assets/felipe-coutinho.jpg';

export const FELIPE = {
  name: 'Felipe Coutinho',
  initials: 'FC',
  linkedin: 'https://www.linkedin.com/in/felipe-coutinho-164906133/',
  portrait,
  affiliation: 'Business Development Engineer · Murata · Munique, Alemanha',
  bio: 'Engenheiro eletricista com formação em eletrônica automotiva, Felipe Coutinho é Business Development Engineer na Murata, em Munique. Antes, atuou na Tesla, no desenvolvimento do Autopilot, e na ALTEN, em projetos para Porsche e Continental. Tem MBA pela Fundação Getulio Vargas e certificações em gestão ágil, liderança e comunicação.',
  highlights: [
    'Engenharia elétrica e eletrônica automotiva',
    'Experiência profissional internacional',
    'Gestão ágil de projetos com Scrum',
    'Liderança, comunicação e oratória',
  ],
  details: [
    {
      id: 'atuacao',
      title: 'Atuação profissional',
      entries: [
        { title: 'Murata', description: 'Business Development Engineer · 2025–atual · Munique' },
        { title: 'Tesla', description: 'Autopilot Engineer · 2023–2024 · Munique' },
        { title: 'ALTEN Germany', description: 'Function Owner de Power Management (Porsche AG) e System Test Engineer (Continental) · 2022–2023' },
      ],
    },
    {
      id: 'formacao',
      title: 'Formação',
      entries: [
        { title: 'Fundação Getulio Vargas', description: 'MBA em Gestão de Negócios em Comércio e Vendas · 2019–2020' },
        { title: 'Universidade Anhembi Morumbi', description: 'Graduação em Engenharia Elétrica · 2015–2018' },
        { title: 'FATEC Santo André', description: 'Tecnologia em Eletrônica Automotiva · 2012–2014' },
        { title: 'Idiomas', description: 'Português nativo e inglês profissional' },
      ],
    },
    {
      id: 'certificacoes',
      title: 'Certificações',
      entries: [
        { title: 'Leadership', description: 'Escola Conquer · 2023' },
        { title: 'T1 Driving authorization', description: 'Mercedes-Benz Deutschland · 2022' },
        { title: 'Communication and Public Speaking', description: 'Escola Conquer · 2020' },
        { title: 'Scrum — Agile project management', description: 'Impacta Tecnologia · 2019' },
      ],
    },
  ],
};
