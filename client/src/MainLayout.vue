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

    <div id="success-notification-modal" class="modal-overlay" :class="{ show: showSuccessModal }">
      <div class="modal-content">
        <div class="modal-icon">
          <i class="fa-solid fa-circle-check" style="color: var(--success-green)"></i>
        </div>
        <h2>Berhasil!</h2>
        <p>{{ successMessage }}</p>
        <button class="submit-button" @click="closeSuccessModal" style="margin-top: 10px">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { roleTypes, type Roles } from '../../server/auth/roles'
import { formatDate, formatCurrency } from '../lib/utils'
import './styles/layout.css'

interface MenuItem {
  path: string
  label: string
  icon: string
}

const route = useRoute()
const router = useRouter()
const { logout } = useAuth()
const showLogoutModal = ref(false)

const confirmLogout = async () => {
  showLogoutModal.value = false
  logout()
  router.push('/')
}

const showSuccessModal = ref(false)
const successMessage = ref('')

const openSuccessModal = (message: string = 'Operasi berhasil!') => {
  successMessage.value = message
  showSuccessModal.value = true
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

provide('formatDate', formatDate)
provide('formatCurrency', formatCurrency)
provide('openSuccessModal', openSuccessModal)

const menuConfig: Record<Roles, MenuItem[]> = {
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

const currentRole = computed<Roles>(() => {
  const pathSegments = route.path.split('/');
  const roleSegment = pathSegments[1];

  return roleTypes.parse(roleSegment);
})

const menuItems = computed(() => menuConfig[currentRole.value] || [])

const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const pageTitle = computed(() => route.meta.title || 'Dashboard')
</script>


