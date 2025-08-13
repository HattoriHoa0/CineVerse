import { createWebHistory, createRouter } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/movies/:id',
    name: 'movie.detail',
    component: () => import('@/views/MovieDetailView.vue'),
    props: true,
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/AuthView.vue'),
  },
  {
    path: '/admin',
    name: 'admin.dashboard',
    component: () => import('@/views/MovieManagementView.vue'),
  },
  {
    path: '/profile',
    name: 'user.profile',
    component: () => import('@/views/UserProfile.vue'),
  },

  {
    path: '/watchlist',
    name: 'user.watchlist',
    component: () => import('@/views/WatchListView.vue'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('@/views/ErrorView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
