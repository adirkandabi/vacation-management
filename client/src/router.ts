import { createRouter, createWebHistory } from 'vue-router'
import RequesterPage from './pages/RequesterPage.vue'
import ValidatorPage from './pages/ValidatorPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/requester' },
    { path: '/requester', name: 'requester', component: RequesterPage },
    { path: '/validator', name: 'validator', component: ValidatorPage },
  ],
})

