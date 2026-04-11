import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'
import yaml from '@rollup/plugin-yaml'
import vueDevTools from 'vite-plugin-vue-devtools'
import prepareBooksDataPlugin from './vite-plugin-prepare-books-data.js'
import prepareImagesPlugin from './vite-plugin-prepare-images.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    yaml(),
    vueDevTools(),
    prepareBooksDataPlugin({
      inputDir: 'src/books',
      outputDir: 'public/books',
      watch: true, // watch changes in dev mode
    }),
    prepareImagesPlugin({
      inputDir: 'src/books',
      inputGenerics: 'src/images',
      tmpDir: 'tmp_images/books',
      outputDir: 'public/books',
      outputGenerics: 'public/images',
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
