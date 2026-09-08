# COUTS — Landing page

App React (Vite) do design **`COUTS Landing.dc.html`**
(projeto Claude Design [`10beece4-…`](https://claude.ai/design/p/10beece4-7cdb-4592-afbe-9ce615b9d4cd)).

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/
npm run preview   # serve o dist/
```

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
  components/
    SiteHeader.jsx  Hero.jsx  Pillars.jsx  MarketSection.jsx  QuoteBand.jsx
    Trainings.jsx   Audiences.jsx  LearnConnectBuild.jsx  WhyUs.jsx
    About.jsx       Contact.jsx  SiteFooter.jsx
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

Cada curso tem seu próprio banner (`src/assets/curso-*.png`, apontado por
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

- **Formulário sem back-end.** `Contact.jsx` é controlado e valida pelo
  navegador, mas o `onSubmit` só troca para o estado "enviado" do design.
  Ponto de integração: o comentário dentro de `onSubmit` — o objeto `values`
  já é o payload completo.
- **Links de redes sociais** apontam para `#contato`; o design não trazia URLs.
- **Peso dos assets: ~21 MB** no `dist/`, contra 211 kB de JS e 18 kB de CSS:
  3 fotos de ~2,1 MB, 4 banners de curso de ~1,7–2,1 MB, logo de 1 MB e vídeo
  de 5,7 MB. Todos vêm sem compressão. Antes de publicar, vale gerar derivados
  com o `ffmpeg`:

  ```sh
  # fotos: ~90 % menores, sem perda visível
  for f in car-city car-mountain car-track; do
    ffmpeg -i "src/assets/$f.png" -vf scale=1600:-2 -q:v 78 "src/assets/$f.webp"
  done

  # banners de curso: têm texto embutido, então use qualidade mais alta
  for f in curso-adas curso-diagnostico curso-eletronica curso-arquitetura; do
    ffmpeg -i "src/assets/$f.png" -q:v 90 "src/assets/$f.webp"
  done

  # vídeo do hero
  ffmpeg -i src/assets/hero-car.mp4 -c:v libx264 -crf 28 -preset slow -an \
    -movflags +faststart src/assets/hero-car.opt.mp4
  ```

  Depois troque os `import` nos componentes (e em `data.js`, no caso dos
  banners). Confira o texto dos banners depois de converter.

- **`src/assets/concept-car.png` não é mais usado** — era o placeholder único
  dos quatro painéis de treinamento, substituído pelos banners de curso. O
  Vite não inclui assets sem `import`, então ele não vai para o `dist/`; pode
  ser apagado quando quiser.
- **`muted` no vídeo do hero.** React aplica `muted` como propriedade, o que
  pode chegar depois de o Chrome avaliar o autoplay — o autoplay é bloqueado e
  o download do vídeo fica adiado indefinidamente (`readyState` 0). Por isso
  `useBackgroundVideo.js` força `defaultMuted`/`muted` antes do `play()`. Não
  remova essas duas linhas.
