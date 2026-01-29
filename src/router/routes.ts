import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LoginPage.vue'),
      },
      {
        path: 'profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { requiresAuth: true },
      },
      // ============================================
      // =         NUEVA RUTA PARA EL SCRAPER         =
      // ============================================
      {
        path: 'scraper-ferrovalle',
        component: () => import('pages/ScraperFerrovallePage.vue'),
        meta: { requiresAuth: true }, // También protegida
      },
      { path: 'carga-buzones', component: () => import('pages/CargaBuzonesPage.vue') },
      {
        path: 'settings',
        component: () => import('pages/SettingsPage.vue'),
        meta: { requiresAuth: true },
      },
      // ============================================
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

