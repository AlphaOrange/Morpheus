import { createRouter, createWebHistory } from 'vue-router'
import TheHomeView from '@/views/TheHomeView.vue'
import { useBookStore } from '@/stores/book'
import { useShelfStore } from '@/stores/shelf'

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
    // Views accessible from sidebar
    {
      path: '/',
      name: 'home',
      component: TheHomeView,
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('@/views/TheLibraryView.vue'),
    },
    {
      path: '/nightstand',
      name: 'nightstand',
      component: () => import('@/views/TheNightstandView.vue'),
      beforeEnter: () => {
        const shelf = useShelfStore()
        if (!shelf.hasSaveData) {
          return '/library'
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
          return '/nightstand'
        }
      },
    },
    {
      path: '/options',
      name: 'options',
      component: () => import('@/views/TheOptionsView.vue'),
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/views/TheHelpView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/TheAboutView.vue'),
    },
    // Additional Views
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
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
