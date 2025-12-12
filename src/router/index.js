import { createRouter, createWebHistory } from 'vue-router'
import TheHomeView from '@/views/TheHomeView.vue'
import { useBookStore } from '@/stores/book'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: TheHomeView,
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('@/views/TheSetupView.vue'),
      beforeEnter: () => {
        const book = useBookStore()
        if (!book.loaded) {
          return '/'
        }
      },
    },
    {
      path: '/book',
      name: 'book',
      component: () => import('@/views/TheBookView.vue'),
      beforeEnter: () => {
        const book = useBookStore()
        if (!book.started) {
          return '/'
        }
      },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
