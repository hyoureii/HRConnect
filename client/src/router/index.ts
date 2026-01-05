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
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('../views/admin/AdminDashboard.vue'),
      meta: { title: 'Admin Dashboard', auth: true, allowedRoles: [1] },
    },
    {
      path: '/admin/manage-user',
      name: 'AdminManageUser',
      component: () => import('../views/admin/AdminManageUser.vue'),
      meta: { title: 'Manajemen User', auth: true, allowedRoles: [1] },
    },
    {
      path: '/admin/leave',
      name: 'AdminLeave',
      component: () => import('../views/admin/AdminLeave.vue'),
      meta: { title: 'Pengajuan Cuti', auth: true, allowedRoles: [1] },
    },
    {
      path: '/admin/payroll',
      name: 'AdminPayroll',
      component: () => import('../views/admin/AdminPayroll.vue'),
      meta: { title: 'Payroll', auth: true, allowedRoles: [1] },
    },
    {
      path: '/admin/business-trip',
      name: 'AdminBusinessTrip',
      component: () => import('../views/admin/AdminBusinessTrip.vue'),
      meta: { title: 'Perjalanan Bisnis', auth: true, allowedRoles: [1] },
    },
  ],
})
