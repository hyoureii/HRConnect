<template>
  <Layout>
    <section id="dashboard" class="content-section">
      <div class="profile-header">
        <div class="profile-pic">
          <i class="fa-solid fa-user"></i>
        </div>
        <div class="welcome-text">
          <h2>Hola, Fathir!</h2>
          <p>Enjoy your life and stay motivated!</p>
        </div>
      </div>

      <div class="widget-grid">
        <div class="widget text-widget">
          <i class="widget-icon fa-solid fa-calendar-check"></i>
          <h3>Sisa Cuti Tahunan</h3>
          <p class="big-text">{{ leaveBalance }} <span class="small-text">Hari</span></p>
        </div>

        <div class="widget" v-if="businessTrips.length > 0">
          <i class="widget-icon fa-solid fa-plane-departure"></i>
          <h3>Perjalanan Bisnis Mendatang</h3>
          <ul class="info-list">
            <li v-for="(trip, index) in businessTrips" :key="index">
              <i class="list-icon fa-solid fa-calendar-day"></i>
              <span>{{ trip.description }}</span>
              <strong>{{ trip.startDate ? new Date(trip.startDate).toLocaleDateString('id-ID') : '' }}</strong>
            </li>
          </ul>
        </div>
        <div class="widget" v-else>
          <i class="widget-icon fa-solid fa-plane-departure"></i>
          <h3>Perjalanan Bisnis</h3>
          <div class="empty-state">
            <i class="fa-solid fa-calendar-xmark empty-icon"></i>
            <p>Belum ada jadwal perjalanan bisnis saat ini.</p>
          </div>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Layout from '@/Layout.vue'
import { client } from '@/utils/client'

const leaveBalance = ref(10)
const businessTrips = ref([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    const tripsResult = await client.api.trips.get({ query: { status: 'approved' } })

    if (tripsResult.data) {
      // Filter for approved trips starting today or later
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      businessTrips.value = tripsResult.data
        .filter(trip => trip.status === 'approved' && new Date(trip.startDate) >= today)
        .slice(0, 2) // Show only 2 upcoming trips
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.content-section {
  display: block;
}

.task-list {
  list-style: none;
  margin-top: 20px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid var(--border-color);
}

.task-item:last-child {
  border-bottom: none;
}

.task-info .task-name {
  font-weight: 500;
  color: var(--dark-text);
}

.task-info .task-status {
  font-size: 13px;
  color: var(--grey-text);
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 200px;
}

.progress-bar-container {
  flex-grow: 1;
  height: 8px;
  background-color: var(--light-grey-bg);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-blue);
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}

.progress-bar.in-progress {
  width: 80%;
}

.progress-bar.completed {
  background-color: var(--success-green);
  width: 100%;
}

.progress-bar.not-started {
  width: 0%;
}
</style>
