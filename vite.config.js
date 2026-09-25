import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Caminhos absolutos: o site tem páginas em subpastas (/treinamentos/…),
  // onde `./assets/…` apontaria para o lugar errado.
  base: '/',
  define: {
    // Ano do © no rodapé, fixado no build para o HTML estático e a hidratação
    // renderizarem o mesmo texto.
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
});
