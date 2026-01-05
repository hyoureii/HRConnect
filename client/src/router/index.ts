import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { authClient } from '@hrconnect/lib'
import { getRoleName, capitalize, isValidRoleId } from '../utils/roles'
import type { RoleId } from '../validation/schemas'
import { client } from '@/utils/client'

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
      path: '/supervisor/dashboard',
      name: 'SupervisorDashboard',
      component: () => import('../views/supervisor/SupervisorDashboard.vue'),
      meta: { title: 'Supervisor Dashboard', auth: true, allowedRoles: [2] },
    },
    {
      path: '/supervisor/leave',
      name: 'SupervisorLeave',
      component: () => import('../views/supervisor/SupervisorLeave.vue'),
      meta: { title: 'Persetujuan Cuti', auth: true, allowedRoles: [2] },
    },
    {
      path: '/supervisor/payroll',
      name: 'SupervisorPayroll',
      component: () => import('../views/supervisor/SupervisorPayroll.vue'),
      meta: { title: 'Payroll', auth: true, allowedRoles: [2] },
    },
    {
      path: '/supervisor/business-trip',
      name: 'SupervisorBusinessTrip',
      component: () => import('../views/supervisor/SupervisorBusinessTrip.vue'),
      meta: { title: 'Perjalanan Bisnis', auth: true, allowedRoles: [2] },
    },
  ],
})

router.beforeEach(async (to) => {
  const requiresAuth = to.meta.auth
  const allowedRoles = to.meta.allowedRoles

  const session = await authClient.getSession()
  const user = session.data?.user

  const roleResult = await client.api.users.me.role.get()
  const roleData = roleResult.data as { roleId: number | null; roleName: string | null } | null

  if (to.name === 'Login') {
    if (user) {
      if (roleData?.roleId && isValidRoleId(roleData.roleId)) {
        const userRoleName = getRoleName(roleData.roleId as RoleId)
        return { name: `${capitalize(userRoleName)}Dashboard`, query: { redirect: to.fullPath }}
      }
    }
    return
  }

  if (requiresAuth) {
    if (!user) {
      return { name: "Unauthorized" }
    }

    if (!roleData?.roleId || !isValidRoleId(roleData.roleId)) {
      await authClient.signOut()
      return { name: "Unauthorized" }
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(roleData.roleId)) {
        if (isValidRoleId(roleData.roleId)) {
          const userRoleName = getRoleName(roleData.roleId as RoleId)
          return { name: `${capitalize(userRoleName)}Dashboard` }
        }
      }
    }
  }
})

export default router
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
