import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { useAuth } from '../stores/auth'
import { roleTypes } from '../../../server/auth/roles'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    auth: boolean
    allowedRoles?: string[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/unauthorized',
      name: 'Unauthorized',
      component: () => import('../views/UnauthorizedView.vue'),
      meta: { title: 'Unauthorized', auth: false },
    },
    {
      path: '/employee/dashboard',
      name: 'EmployeeDashboard',
      component: () => import('../views/employee/EmployeeDashboard.vue'),
      meta: { title: 'Employee Dashboard', auth: true, allowedRoles: ['employee'] },
    },
    {
      path: '/employee/leave',
      name: 'EmployeeLeave',
      component: () => import('../views/employee/EmployeeLeave.vue'),
      meta: { title: 'Pengajuan Cuti', auth: true, allowedRoles: ['employee'] },
    },
    {
      path: '/employee/payroll',
      name: 'EmployeePayroll',
      component: () => import('../views/employee/EmployeePayroll.vue'),
      meta: { title: 'Payroll', auth: true, allowedRoles: ['employee'] },
    },
    {
      path: '/employee/business-trip',
      name: 'EmployeeBusinessTrip',
      component: () => import('../views/employee/EmployeeBusinessTrip.vue'),
      meta: { title: 'Perjalanan Bisnis', auth: true, allowedRoles: ['employee'] },
    },
    {
      path: '/supervisor/dashboard',
      name: 'SupervisorDashboard',
      component: () => import('../views/supervisor/SupervisorDashboard.vue'),
      meta: { title: 'Supervisor Dashboard', auth: true, allowedRoles: ['supervisor'] },
    },
    {
      path: '/supervisor/leave',
      name: 'SupervisorLeave',
      component: () => import('../views/supervisor/SupervisorLeave.vue'),
      meta: { title: 'Persetujuan Cuti', auth: true, allowedRoles: ['supervisor'] },
    },
    {
      path: '/supervisor/payroll',
      name: 'SupervisorPayroll',
      component: () => import('../views/supervisor/SupervisorPayroll.vue'),
      meta: { title: 'Payroll', auth: true, allowedRoles: ['supervisor'] },
    },
    {
      path: '/supervisor/business-trip',
      name: 'SupervisorBusinessTrip',
      component: () => import('../views/supervisor/SupervisorBusinessTrip.vue'),
      meta: { title: 'Perjalanan Bisnis', auth: true, allowedRoles: ['supervisor'] },
    },
    {
      path: '/finance/dashboard',
      name: 'FinanceDashboard',
      component: () => import('../views/finance/FinanceDashboard.vue'),
      meta: { title: 'Finance Dashboard', auth: true, allowedRoles: ['finance'] },
    },
    {
      path: '/finance/leave',
      name: 'FinanceLeave',
      component: () => import('../views/finance/FinanceLeave.vue'),
      meta: { title: 'Pengajuan Cuti', auth: true, allowedRoles: ['finance'] },
    },
    {
      path: '/finance/payroll',
      name: 'FinancePayroll',
      component: () => import('../views/finance/FinancePayroll.vue'),
      meta: { title: 'Payroll', auth: true, allowedRoles: ['finance'] },
    },
    {
      path: '/finance/business-trip',
      name: 'FinanceBusinessTrip',
      component: () => import('../views/finance/FinanceBusinessTrip.vue'),
      meta: { title: 'Perjalanan Bisnis', auth: true, allowedRoles: ['finance'] },
    },
    {
      path: '/hrd/dashboard',
      name: 'HrdDashboard',
      component: () => import('../views/hrd/HRDDashboard.vue'),
      meta: { title: 'HRD Dashboard', auth: true, allowedRoles: ['hrd'] },
    },
    {
      path: '/hrd/leave',
      name: 'HRDLeave',
      component: () => import('../views/hrd/HRDLeave.vue'),
      meta: { title: 'Pengajuan Cuti', auth: true, allowedRoles: ['hrd'] },
    },
    {
      path: '/hrd/payroll',
      name: 'HRDPayroll',
      component: () => import('../views/hrd/HRDPayroll.vue'),
      meta: { title: 'Payroll', auth: true, allowedRoles: ['hrd'] },
    },
    {
      path: '/hrd/business-trip',
      name: 'HRDBusinessTrip',
      component: () => import('../views/hrd/HRDBusinessTrip.vue'),
      meta: { title: 'Perjalanan Bisnis', auth: true, allowedRoles: ['hrd'] },
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('../views/admin/AdminDashboard.vue'),
      meta: { title: 'Admin Dashboard', auth: true, allowedRoles: ['admin'] },
    },
    {
      path: '/admin/manage-user',
      name: 'AdminManageUser',
      component: () => import('../views/admin/AdminManageUser.vue'),
      meta: { title: 'Manajemen User', auth: true, allowedRoles: ['admin'] },
    },
    {
      path: '/admin/leave',
      name: 'AdminLeave',
      component: () => import('../views/admin/AdminLeave.vue'),
      meta: { title: 'Pengajuan Cuti', auth: true, allowedRoles: ['admin'] },
    },
    {
      path: '/admin/payroll',
      name: 'AdminPayroll',
      component: () => import('../views/admin/AdminPayroll.vue'),
      meta: { title: 'Payroll', auth: true, allowedRoles: ['admin'] },
    },
    {
      path: '/admin/business-trip',
      name: 'AdminBusinessTrip',
      component: () => import('../views/admin/AdminBusinessTrip.vue'),
      meta: { title: 'Perjalanan Bisnis', auth: true, allowedRoles: ['admin'] },
    },
  ],
})

router.beforeEach(async (to) => {
  const store = useAuth()

  if (!store.session) {
   await store.restoreSession();
  }

  const user = store.session?.user;
  const userRole = user?.role;

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  if (to.name === 'Login') {
    if (user && userRole && roleTypes.safeParse(userRole).success) {
      return { name: `${capitalize(userRole)}Dashboard` }
    }
    return
  }

  if (to.meta.auth) {
    if (!user || !userRole || !roleTypes.safeParse(userRole).success) {
      return { name: 'Unauthorized' }
    }

    const allowedRoles = to.meta.allowedRoles
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRole)) {
        return { name: `${capitalize(userRole)}Dashboard` }
      }
    }
  }
})

export default router
