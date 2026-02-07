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
  faBookAtlas,
  faSliders,
  faCircleQuestion,
  faBookOpen,
  faAddressCard,
  faMaximize,
} from '@fortawesome/free-solid-svg-icons'
library.add(
  faPersonWalking,
  faDoorOpen,
  faMapLocationDot,
  faComment,
  faComments,
  faStar,
  faBookAtlas,
  faSliders,
  faCircleQuestion,
  faBookOpen,
  faAddressCard,
  faMaximize,
)

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
