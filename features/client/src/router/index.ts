import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    auth: boolean
    allowedRoles?: number[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/finance/dashboard',
      name: 'FinanceDashboard',
      component: () => import('../views/finance/FinanceDashboard.vue'),
      meta: { title: 'Finance Dashboard', auth: true, allowedRoles: [3] },
    },
    {
      path: '/finance/leave',
      name: 'FinanceLeave',
      component: () => import('../views/finance/FinanceLeave.vue'),
      meta: { title: 'Pengajuan Cuti', auth: true, allowedRoles: [3] },
    },
    {
      path: '/finance/payroll',
      name: 'FinancePayroll',
      component: () => import('../views/finance/FinancePayroll.vue'),
      meta: { title: 'Payroll', auth: true, allowedRoles: [3] },
    },
    {
      path: '/finance/business-trip',
      name: 'FinanceBusinessTrip',
      component: () => import('../views/finance/FinanceBusinessTrip.vue'),
      meta: { title: 'Perjalanan Bisnis', auth: true, allowedRoles: [3] },
    },
  ],
})
