<template>
  <MainLayout>
    <section id="dashboard" class="content-section">
        <div class="profile-header">
          <div class="profile-pic">
            <i class="fa-solid fa-user"></i>
          </div>
          <div class="welcome-text">
            <h2>Hola, {{ userName }}!</h2>
            <p>Enjoy your life and stay motivated!</p>
          </div>
        </div>

      <div class="widget-grid">
        <div class="widget text-widget">
          <i class="widget-icon fa-solid fa-users"></i>
          <h3>Total Pengguna</h3>
          <p class="big-text">{{ stats.totalUsers }} <span class="small-text">Orang</span></p>
        </div>
        <div class="widget text-widget">
          <i class="widget-icon fa-solid fa-file-invoice"></i>
          <h3>Cuti Menunggu</h3>
          <p class="big-text">{{ stats.pendingLeaves }} <span class="small-text">Pengajuan</span></p>
        </div>
        <div class="widget text-widget">
          <i class="widget-icon fa-solid fa-plane-departure"></i>
          <h3>Perjalanan Menunggu</h3>
          <p class="big-text">{{ stats.pendingTrips }} <span class="small-text">Pengajuan</span></p>
        </div>
        <div class="widget text-widget">
          <i class="widget-icon fa-solid fa-file-invoice-dollar"></i>
          <h3>Reimburse Menunggu</h3>
          <p class="big-text">{{ stats.pendingReimbursements }} <span class="small-text">Pengajuan</span></p>
        </div>
        <div class="widget" v-if="businessTrips.length > 0">
          <i class="widget-icon fa-solid fa-calendar-check"></i>
          <h3>Perjalanan Bisnis Mendatang</h3>
          <ul class="info-list">
            <li v-for="(trip, index) in businessTrips" :key="index">
              <i class="list-icon fa-solid fa-calendar-day"></i>
              <span>{{ trip.description }}</span>
              <strong>{{ trip.startDate ? new Date(trip.startDate).toLocaleDateString('id-ID') : '' }}</strong>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue'
import MainLayout from '@/MainLayout.vue'
import { useAuth } from '@/stores/auth'
import { client } from '../../../lib/client'

const store = useAuth()
const formatDate = inject('formatDate') as (date: string) => string

const userName = computed(() => store.session?.user?.name || 'User')

const stats = ref({
  totalUsers: 0,
  pendingLeaves: 0,
  pendingTrips: 0,
  pendingReimbursements: 0,
})

const businessTrips = ref([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    const [statsResult, tripsResult] = await Promise.all([
      client.api.stats.get(),
      client.api.trips.get(),
    ])

    if (statsResult.data) {
      stats.value = statsResult.data
    }

    if (tripsResult.data) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      businessTrips.value = tripsResult.data
        .filter(trip => trip.status === 'approved' && new Date(trip.startDate) >= today)
        .slice(0, 2)
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.activity-log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

.activity-log-table th,
.activity-log-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.activity-log-table thead th {
  background-color: var(--light-grey-bg);
  font-weight: 600;
  color: var(--dark-text);
}

.activity-log-table tbody tr:last-child td {
  border-bottom: none;
}

.activity-log-table td:last-child {
  color: var(--grey-text);
}

.role-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-tag.employee {
  background-color: #eaf2ff;
  color: #0066ff;
}
.role-tag.supervisor {
  background-color: #d4efdf;
  color: #155724;
}
.role-tag.finance {
  background-color: #f8d7da;
  color: #721c24;
}
.role-tag.admin {
  background-color: #fdebd0;
  color: #856404;
}
.role-tag.hrd {
  background-color: #d6d8db;
  color: #383d41;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-tag.active {
  background-color: #d4efdf;
  color: #155724;
}
.status-tag.non-active {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
