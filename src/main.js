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

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faBookAtlas,
  faBookBookmark,
  faBookmark,
  faBookOpenReader,
  faBuildingColumns,
  faCirclePlay,
  faCircleQuestion,
  faCircleXmark,
  faComment,
  faComments,
  faDoorOpen,
  faFlag,
  faHourglassHalf,
  faMapLocationDot,
  faMaximize,
  faMoon,
  faPersonWalking,
  faSignature,
  faSliders,
  faStar,
} from '@fortawesome/free-solid-svg-icons'
library.add(
  faArrowLeft,
  faBookAtlas,
  faBookBookmark,
  faBookmark,
  faBookOpenReader,
  faBuildingColumns,
  faCirclePlay,
  faCircleQuestion,
  faCircleXmark,
  faComment,
  faComments,
  faDoorOpen,
  faFlag,
  faHourglassHalf,
  faMapLocationDot,
  faMaximize,
  faMoon,
  faPersonWalking,
  faSignature,
  faSliders,
  faStar,
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
