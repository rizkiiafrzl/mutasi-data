import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/dashboard.vue';
import Report from '../views/Report.vue';
import Massal from '../views/Massal.vue';
import Workers from '../views/Workers.vue';

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: Dashboard },
  { path: '/report', component: Report },
  { path: '/massal', component: Massal },
  { path: '/workers', component: Workers },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;

