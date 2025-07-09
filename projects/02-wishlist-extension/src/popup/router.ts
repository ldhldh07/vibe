import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'
import Brands from './views/Brands.vue'
import Categories from './views/Categories.vue'
import Alerts from './views/Alerts.vue'
import Settings from './views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/brands',
    name: 'Brands', 
    component: Brands
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: Alerts
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router