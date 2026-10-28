# COUTS — Landing page

App React (Vite) do design **`COUTS Landing.dc.html`**
(projeto Claude Design [`10beece4-…`](https://claude.ai/design/p/10beece4-7cdb-4592-afbe-9ce615b9d4cd)).

```sh
npm install
npm run dev       # http://localhost:5173 (SPA, sem prerender)
npm run build     # bundle + SSR + prerender → dist/
npm run preview   # serve o dist/
```

## SEO e geração estática

O site é React + Vite, mas cada página sai do build como **HTML completo**
(conteúdo, title, description, canonical, Open Graph e JSON-LD), sem depender
de JavaScript para ser lida por Google, Bing, LinkedIn ou WhatsApp. O React
só hidrata o HTML pronto.

| Etapa | O que faz |
| ----- | --------- |
| `vite build` | bundle do navegador em `dist/` (`index.html` vira o molde) |
| `vite build --ssr src/entry-server.jsx` | versão Node dos componentes |
| `scripts/prerender.mjs` | grava um HTML por rota, `404.html`, `sitemap.xml` e `robots.txt` |

- **Rotas e metadados:** `src/routes.js` (title, description, OG, JSON-LD de
  cada página). Novas páginas entram ali e ganham sitemap automaticamente.
- **Treinamentos:** ficam só na página inicial, nas abas de `#treinamentos`.
  `/#tab-01` … `/#tab-04` abrem a aba correspondente (usado pelos cartões das
  tecnologias e pelo rodapé). As antigas páginas `/treinamentos/...` foram
  removidas e redirecionam (308) para essas âncoras em `vercel.json`.
- **Vercel:** `vercel.json` liga `cleanUrls`, remove barra final, redireciona
  as antigas páginas de treinamento, aplica cache longo em `/assets/` e
  cabeçalhos de segurança.
- **Contato, redes e analytics:** `src/site.js` e `src/analytics.js`, ligados
  por variáveis de ambiente — veja `.env.example`. O formulário envia para
  coutstech@gmail.com via FormSubmit (`CONTACT.formEndpoint`).
- **Imagens:** WebP com `srcset` (originais em PNG ficam no histórico do Git).
  Ícones e imagens de compartilhamento ficam em `public/`.

`base` do Vite agora é `/` (absoluto): com páginas em subpastas, caminhos
relativos (`./assets`) quebrariam.

## CRM de leads (`/admin/crm`)

Mesmo modelo do CRM da Mundi Data: os contatos do formulário do site viram
leads em um banco Supabase, e a equipe acompanha tudo em `/admin/crm` —
indicadores, busca, filtro por responsável, exportação para Excel, detalhe do
lead com as mensagens recebidas, empresas, agenda de atividades (pendentes,
realizadas e sequência por lead) e, para o admin, aprovação de acessos e
equipe. Ficaram de fora o que a interface da Mundi Data já não usava
(oportunidades, funil, GA4 no painel e fila de e-mails).

O site não tem link para o painel. A equipe entra por `/login`; conhecer a URL
não dá acesso: a API exige sessão com perfil ativo e o banco aplica RLS.

| Peça | Onde |
| ---- | ---- |
| Banco, papéis e regras (RLS) | `supabase/migrations/202610270001_crm.sql` |
| API (funções da Vercel) | `api/leads.js` (captação pública), `api/crm/[entity].js`, `api/auth/`, `api/access-requests.js` |
| Validação e clientes Supabase | `server/` |
| Telas | `admin.html` + `src/admin/` (entrada Vite separada; não pesa na landing) |
| Rotas | `vercel.json` (rewrites) e `scripts/dev-api.mjs` (o mesmo no `npm run dev`) |

**Formulário.** `Contact.jsx` envia em paralelo para o CRM (`/api/leads`) e
para o e-mail via FormSubmit, e mostra sucesso se um dos dois confirmar.
Enquanto o Supabase não estiver configurado, o CRM responde 503 e o e-mail
segue funcionando como antes. Reenvios usam o mesmo `request_id` e não
duplicam o lead; o mesmo e-mail vira uma nova mensagem no lead existente.

**Papéis.** `admin` vê e faz tudo (inclusive excluir e aprovar acessos);
`gestor` vê todos os leads, reatribui e edita empresas; `comercial` vê só a
própria carteira. Novos leads vão para o comercial ativo com menos leads; sem
comercial, ficam "Sem responsável". Concluir uma ligação, e-mail ou reunião
marca o lead como "Contatado".

### Ativar

1. Crie um projeto em [supabase.com](https://supabase.com) (o plano gratuito
   basta).
2. **SQL Editor** → cole e rode `supabase/migrations/202610270001_crm.sql`
   (uma vez só).
3. **Vercel → Settings → Environment Variables:** `SUPABASE_URL`,
   `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (em Supabase → Project
   Settings → API Keys) e `APP_URL=https://www.coutstech.com`. Publique de
   novo. A chave secreta fica só no servidor — nunca com prefixo `VITE_`.
4. **Supabase → Authentication → URL Configuration:** Site URL
   `https://www.coutstech.com` e, em Redirect URLs,
   `https://www.coutstech.com/auth/callback` e
   `https://www.coutstech.com/auth/callback?next=reset`.
5. **Primeiro admin:** Authentication → Users → *Add user* (e-mail e senha,
   marcando *Auto Confirm*). Copie o UUID e rode no SQL Editor:

   ```sql
   insert into public.profiles (id, name, role)
   values ('UUID_DO_USUARIO', 'Seu nome', 'admin');
   ```

6. Abra `https://www.coutstech.com/login`. Outras pessoas usam "Não tenho
   conta — solicitar acesso" e o admin aprova em **Configurações** (entram
   como `comercial`; o papel pode ser trocado em "Editar acesso").

Para a recuperação de senha funcionar fora do time do projeto, configure um
SMTP próprio em Authentication → SMTP Settings (o padrão do Supabase só envia
para membros do projeto e tem limite baixo).

**Local:** com as mesmas variáveis no `.env`, `npm run dev` já serve `/login`,
`/admin/crm` e `/api/*`. `npm test` roda a migration num PostgreSQL embutido
(PGlite) e confere captação, deduplicação, RLS entre comerciais, aprovação de
acesso e limite de tentativas — sem tocar no Supabase real.

## Estrutura

```
index.html                    shell do Vite (meta tags, fontes, #root)
vite.config.js
src/
  main.jsx                    monta o App e importa o CSS
  App.jsx                     ordem das seções
  styles.css                  tokens, layout e responsividade (CSS global)
  data.js                     todo o conteúdo (textos, listas, tópicos)
  config.js                   props de autoria do design
  hooks/
    useBackgroundVideo.js     velocidade, reduced-motion e pausa fora da tela
  site.js                     dados institucionais e canais de contato
  routes.js                   rotas, metadados e JSON-LD
  analytics.js                eventos GA4/dataLayer
  entry-server.jsx            render para o prerender
  pages/                      HomePage, NotFoundPage
  components/
    SiteHeader.jsx  Hero.jsx  Pillars.jsx  MarketSection.jsx  QuoteBand.jsx
    Trainings.jsx   Audiences.jsx  LearnConnectBuild.jsx  WhyUs.jsx
    Teachers.jsx    Contact.jsx   SiteFooter.jsx
    Eyebrow.jsx     Logo.jsx
  assets/                     imagens e vídeo importados do projeto de design
```

O CSS é um arquivo global com tokens em `:root` e classes BEM-ish — não há CSS
Modules nem CSS-in-JS. Os nomes de classe são os mesmos do design, o que
mantém o markup fácil de conferir contra o artboard original.

Conteúdo mora em `src/data.js`, separado dos componentes: editar um texto ou
adicionar um tópico de treinamento não exige mexer em JSX.

## Como o design foi traduzido

| Design (`.dc.html`)                      | Implementação                                      |
| ---------------------------------------- | -------------------------------------------------- |
| `x-dc` + `support.js` (runtime dc/React) | componentes React de verdade                       |
| `style="…"` inline                       | `src/styles.css` com tokens em `:root`             |
| `style-hover` / `style-focus`            | `:hover` / `:focus` reais                          |
| `sc-for list={…}`                        | `.map()` sobre as listas de `data.js`              |
| `sc-if` + estado `active` das abas       | `useState` em `Trainings.jsx`                      |
| `renderVals()` / `DCLogic`               | hooks e handlers nos próprios componentes          |
| `ref={{ videoRef }}` + `applySpeed()`    | `useBackgroundVideo.js`                            |

As abas de treinamentos seguem o padrão ARIA: `role="tablist"`, seleção por
clique, navegação por setas/Home/End e `tabIndex` móvel entre as abas.

### Banners de curso

Cada curso tem seu próprio banner (`src/assets/treinamento-*-1672.webp` + versão 836 px, apontados por
`banner` em `TECHS`). Eles já trazem título, descrição e ícones de apoio na
própria arte, o que define como o painel é montado:

- o painel é um grid de duas colunas (`1.1fr 1fr`): banner à esquerda,
  conteúdo programático à direita. Abaixo de 1000px vira coluna única, com o
  banner em cima;
- entram **inteiros**, na proporção nativa 1672 × 941 — sem `object-fit: cover`
  e sem escurecimento, porque qualquer um dos dois cortaria ou apagaria o
  texto da arte;
- o `aspect-ratio` fica no CSS, então o espaço é reservado antes do download e
  a altura do painel não pula ao trocar de aba;
- título e descrição continuam no DOM, mas ficam só para leitores de tela em
  telas largas (`.tech-panel__heading`), para não duplicar o que a arte já
  mostra. Abaixo de 760px, onde a arte fica pequena demais para ler, eles
  voltam a ser texto visível acima da imagem.

Para trocar um banner, basta substituir o arquivo mantendo a proporção 16:9.
Se a proporção mudar, ajuste o `aspect-ratio` de `.tech-panel__banner img` e o
`BANNER_SIZE` em `data.js`.

## Quem está por trás (bloco 5)

A seção `#professores` fica logo após “Por que aprender conosco” na página
principal e apresenta Felipe Coutinho. O menu “Instrutores” leva diretamente à
seção. O site tem uma única entrada HTML.

O bloco reproduz a arte de referência enviada pelo usuário em 16/09/2026
(`ChatGPT Image 16 de set. de 2026, 16_16_29.png`, 1672 × 941), com as cores
do site no lugar do vermelho. O conteúdo vem do documento “Update estrutura
LP”: o perfil em bullet points, em vez do formato de currículo.

- `src/components/Teachers.jsx` e `Teachers.css`: título, texto de abertura,
  lista com ícones de check e a foto à direita.
- `src/felipe.js`: texto de abertura, os 7 destaques, a foto e o texto
  alternativo dela.

### Como a arte foi traduzida

- **Escala.** `--u` vale 1 px da arte na largura da tela (1 px a partir de
  1672 px). A coluna de texto e a posição da foto são as medidas da arte vezes
  `--u`, então a composição é a mesma em qualquer desktop. Acima de 1672 px ela
  para de crescer e fica centralizada.
- **Tipografia.** Os tamanhos seguem a escala das outras seções, e não os da
  arte, que ficavam grandes demais no site: título de 32 a 44 px, texto de
  abertura de 15,5 a 17,5 px e lista de 14,5 a 15,5 px. O texto fica
  centralizado na altura da foto.
- **Fonte.** A arte usa Montserrat (400 e 700), carregada no `index.html` junto
  com as outras fontes. Ela vale só neste bloco.
- **Rótulo.** “05 — Quem está por trás” fica acima do título, no mesmo padrão
  (`Eyebrow`) das outras seções. Ele não existe na arte.
- **Quebras de linha.** Os `\n` dos textos em `felipe.js` repetem as linhas da
  arte no desktop (`white-space: pre-line`). Abaixo de 1100 px viram espaço e
  o texto quebra normalmente.
- **Foto.** `src/assets/felipe-industria-automotiva.webp` é a área da foto da
  arte (a partir de x = 600 px). “Indústria automotiva” e “Tecnologia •
  Pessoas • Mobilidade” fazem parte da imagem. O vermelho virou azul
  transferindo o excesso de vermelho de cada pixel para verde e azul, com o
  vermelho puro caindo em `#4DB8FF` (≈ `--accent`). Rosto, pescoço e mãos
  ficaram protegidos por máscara, para a pele não mudar de cor, e os restos do
  título da coluna esquerda foram apagados.
- **Telas menores.** Abaixo de 1100 px o bloco vira coluna única: a foto abre
  o bloco e o texto vem embaixo. No celular a foto usa recorte 4:5, que mantém
  o rosto e os dizeres inteiros.

Para trocar a foto por outra versão da arte, recorte a mesma área (a partir
de x = 600 px de uma arte 1672 × 941) e atualize `width`/`height` em
`Teachers.jsx` se o tamanho mudar.

## Props do canvas

O design expõe três controles de autoria. Não são recursos do site, então
viraram constantes:

| Prop         | Padrão | Onde mudar                            |
| ------------ | ------ | ------------------------------------- |
| `heroDim`    | 15 %   | `HERO_DIM_PERCENT` em `src/config.js` |
| `videoSpeed` | 1 ×    | `VIDEO_SPEED` em `src/config.js`      |
| `techView`   | `Abas` | só o modo `Abas` foi implementado     |

`techView: "Lista completa"` é a visão alternativa usada para revisar todo o
conteúdo programático de uma vez dentro do canvas — não foi portada. Se
precisar existir no site, os dados já estão prontos em `TECHS`.

## Pendências conhecidas

- **Formulário via FormSubmit.** Os envios vão para coutstech@gmail.com. O
  FormSubmit exige uma ativação única (link no e-mail "Action Required"); sem
  ela, os envios não chegam. Para esconder o e-mail no código, troque o
  endereço no endpoint pelo código aleatório que o FormSubmit envia após a
  ativação.
- **Redes sociais** só aparecem com URL configurada (`.env.example`).
- **Vídeo do hero:** `hero-carro-720.mp4` (1,8 MB) e `hero-carro-360.mp4`
  (0,6 MB, servido abaixo de 760 px), ambos sem áudio e com `faststart`.
- **`muted` no vídeo do hero.** React aplica `muted` como propriedade, o que
  pode chegar depois de o Chrome avaliar o autoplay — o autoplay é bloqueado e
  o download do vídeo fica adiado indefinidamente (`readyState` 0). Por isso
  `useBackgroundVideo.js` força `defaultMuted`/`muted` antes do `play()`. Não
  remova essas duas linhas.

## Contato por curso, privacidade e GA4

- Cada curso aponta para `#contato-01` a `#contato-04`, selecionando o interesse sem apagar os outros campos.
- `/privacidade` é pré-renderizada e aparece no rodapé e no formulário.
- Configure `VITE_GA_MEASUREMENT_ID=G-...` no ambiente e gere um novo build. Nenhum ID fictício é usado.
- O GA4 só carrega com ID válido e aceite das métricas. A preferência pode ser alterada na política de privacidade.
- Eventos: `course_contact_click`, `cta_click`, `contact_click`, `form_error`, `form_submit` e `generate_lead` (este último somente após confirmação do endpoint).
- Na propriedade GA4, marque `generate_lead` como evento principal. Desative a medição otimizada de interações com formulários para evitar contar envios tentados como conversões; revise também eventos automáticos e coleta de dados nas configurações da propriedade.
- Validação em produção: aceite as métricas, clique em um curso e confirme o interesse selecionado; faça um envio autorizado e confira `course_contact_click` e `generate_lead` no Tempo real/DebugView. Confira também a recusa em uma sessão limpa: sem requisição ao gtag e sem novos cookies GA.
- A confirmação do recebimento no GA4 depende de acesso à propriedade e do ID real. O build e os testes locais não comprovam recebimento remoto.
