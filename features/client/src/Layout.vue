<template>
  <div class="page-container">
    <aside class="sidebar">
      <h1 class="app-name">HRConnect</h1>
      <ul class="sidebar-menu">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="menu-item"
            :class="{ active: isActiveRoute(item.path) }"
          >
            <i :class="item.icon"></i> {{ item.label }}
          </router-link>
        </li>
      </ul>
    </aside>

    <div class="main-content">
      <nav class="navbar">
        <div class="navbar-title">{{ pageTitle }}</div>
        <a href="#" class="logout-button" @click.prevent="showLogoutModal = true">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </a>
      </nav>

      <main class="content-area">
        <slot />
      </main>
    </div>

    <div id="logout-confirmation-modal" class="modal-overlay" :class="{ show: showLogoutModal }">
      <div class="modal-content">
        <div class="modal-icon">
          <i class="fa-solid fa-circle-question" style="color: var(--warning-orange)"></i>
        </div>
        <h2>Konfirmasi Logout</h2>
        <p>Apakah Anda yakin ingin keluar dari akun ini?</p>
        <div class="modal-actions">
          <button
            class="btn-confirm-yes"
            style="background-color: var(--danger-red)"
            @click="confirmLogout"
          >
            Ya, Keluar
          </button>
          <button class="btn-confirm-no" @click="showLogoutModal = false">Batal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import type { RoleName } from '@/validation/schemas'
import './styles/layout.css'

interface MenuItem {
  path: string
  label: string
  icon: string
}

const route = useRoute()
const router = useRouter()
const { signOut } = useAuth()
const showLogoutModal = ref(false)

const confirmLogout = async () => {
  showLogoutModal.value = false
  await signOut()
  router.push('/')
}

const menuConfig: Record<RoleName, MenuItem[]> = {
  employee: [
    { path: '/employee/dashboard', label: 'Dashboard', icon: 'fa-solid fa-tachograph-digital' },
    { path: '/employee/leave', label: 'Cuti', icon: 'fa-solid fa-calendar-alt' },
    { path: '/employee/payroll', label: 'Payroll', icon: 'fa-solid fa-file-invoice-dollar' },
    {
      path: '/employee/business-trip',
      label: 'Perjalanan Bisnis',
      icon: 'fa-solid fa-plane-departure',
    },
  ],
  supervisor: [
    { path: '/supervisor/dashboard', label: 'Dashboard', icon: 'fa-solid fa-tachograph-digital' },
    { path: '/supervisor/leave', label: 'Cuti', icon: 'fa-solid fa-calendar-alt' },
    { path: '/supervisor/payroll', label: 'Payroll', icon: 'fa-solid fa-file-invoice-dollar' },
    {
      path: '/supervisor/business-trip',
      label: 'Perjalanan Bisnis',
      icon: 'fa-solid fa-plane-departure',
    },
  ],
  finance: [
    { path: '/finance/dashboard', label: 'Dashboard', icon: 'fa-solid fa-tachograph-digital' },
    { path: '/finance/leave', label: 'Cuti', icon: 'fa-solid fa-calendar-alt' },
    { path: '/finance/payroll', label: 'Payroll', icon: 'fa-solid fa-file-invoice-dollar' },
    {
      path: '/finance/business-trip',
      label: 'Perjalanan Bisnis',
      icon: 'fa-solid fa-plane-departure',
    },
  ],
  hrd: [
    { path: '/hrd/dashboard', label: 'Dashboard', icon: 'fa-solid fa-tachograph-digital' },
    { path: '/hrd/leave', label: 'Cuti', icon: 'fa-solid fa-calendar-alt' },
    { path: '/hrd/payroll', label: 'Payroll', icon: 'fa-solid fa-file-invoice-dollar' },
    { path: '/hrd/business-trip', label: 'Perjalanan Bisnis', icon: 'fa-solid fa-plane-departure' },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'fa-solid fa-tachograph-digital' },
    { path: '/admin/manage-user', label: 'Manajemen User', icon: 'fa-solid fa-users-gear' },
    { path: '/admin/leave', label: 'Cuti', icon: 'fa-solid fa-calendar-alt' },
    { path: '/admin/payroll', label: 'Payroll', icon: 'fa-solid fa-file-invoice-dollar' },
    {
      path: '/admin/business-trip',
      label: 'Perjalanan Bisnis',
      icon: 'fa-solid fa-plane-departure',
    },
  ],
}

const currentRole = computed<RoleName>(() => {
  // Derive role from current route path
  // Router guard ensures user has correct role for this route
  const pathSegments = route.path.split('/')
  const roleSegment = pathSegments[1] // e.g., '/employee/dashboard' -> 'employee'

  const validRoles: RoleName[] = ['admin', 'supervisor', 'finance', 'hrd', 'employee']
  return validRoles.includes(roleSegment as RoleName) ? roleSegment as RoleName : 'employee'
})

const menuItems = computed(() => menuConfig[currentRole.value] || [])

const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const pageTitle = computed(() => route.meta.title || 'Dashboard')
</script>


