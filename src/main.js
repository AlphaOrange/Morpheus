import 'normalize.css'
import '@/style/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useShelfStore } from '@/stores/shelf'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faPersonWalking,
  faDoorOpen,
  faMapLocationDot,
  faComment,
  faComments,
  faStar,
} from '@fortawesome/free-solid-svg-icons'
library.add(faPersonWalking, faDoorOpen, faMapLocationDot, faComment, faComments, faStar)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

// app.config.globalProperties.$utils = utils;

async function initApp() {
  const shelf = useShelfStore()
  await shelf.loadShelf()
  app.mount('#app')
}

initApp()
