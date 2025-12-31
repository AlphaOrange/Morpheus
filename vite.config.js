import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from '@rollup/plugin-yaml'
import vueDevTools from 'vite-plugin-vue-devtools'
import prepareBooksPlugin from './vite-plugin-prepare-books.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    yaml(),
    vueDevTools(),
    prepareBooksPlugin({
      inputDir: '../Morpheus_Books',
      outputDir: 'public',
      watch: true, // watch changes in dev mode
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
