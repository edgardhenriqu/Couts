import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import { devApi } from './scripts/dev-api.mjs';

export default defineConfig(({ mode, isSsrBuild }) => ({
  // `devApi` executa as funções de api/ dentro do `vite dev`, como a Vercel
  // faria em produção, com as variáveis do .env (inclusive as sem VITE_).
  plugins: [react(), devApi(loadEnv(mode, process.cwd(), ''))],
  // Caminhos absolutos: o site tem páginas em subpastas (/treinamentos/…),
  // onde `./assets/…` apontaria para o lugar errado.
  base: '/',
  define: {
    // Ano do © no rodapé, fixado no build para o HTML estático e a hidratação
    // renderizarem o mesmo texto.
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
  // Duas entradas: o site (index.html, pré-renderizado) e o painel da equipe
  // (admin.html, só no navegador). O build SSR usa a própria entrada.
  build: isSsrBuild
    ? {}
    : {
        rollupOptions: {
          input: { main: 'index.html', admin: 'admin.html' },
          // React fica num arquivo próprio, compartilhado pelas duas entradas.
          output: { manualChunks: (id) => (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id) ? 'react' : undefined) },
        },
        // ExcelJS (~940 kB) só é baixado ao exportar a planilha do CRM.
        chunkSizeWarningLimit: 1000,
      },
}));
