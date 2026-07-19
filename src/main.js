import 'normalize.css'
import '@/style/fonts.css'
import '@/style/vars.css'
import '@/style/main.css'
import '@/style/inputs.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useShelfStore } from '@/stores/shelf'
import { FontAwesomeIcon } from '@/plugins/fontawesome'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

async function initApp() {
  const shelf = useShelfStore()
  await shelf.loadShelf()
  app.mount('#app')
}

initApp()
