import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'
import yaml from '@rollup/plugin-yaml'
import vueDevTools from 'vite-plugin-vue-devtools'
import prepareBooksDataPlugin from './vite-plugin-prepare-books-data.js'
import collectImagesPlugin from './vite-plugin-collect-images.js'
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
    collectImagesPlugin({
      inputDir: 'src/books',
      outputDir: 'tmp_images/books',
    }),
    prepareImagesPlugin({
      genericsDirFrom: 'src/images',
      booksDirFrom: 'tmp_images/books',
      genericsDir: 'public/images',
      booksDir: 'public/books',
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
