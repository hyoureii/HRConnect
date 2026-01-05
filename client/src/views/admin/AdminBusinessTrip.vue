<template>
  <Layout>
    <section id="perjalanan-bisnis" class="content-section">
      <form class="card-form" @submit.prevent="submitBusinessTrip">
        <h2>Formulir Pengajuan Perjalanan Bisnis</h2>
        <div class="form-group-row">
          <div class="form-group">
            <label for="perjalanan-mulai">Tanggal Mulai</label>
            <input type="date" id="perjalanan-mulai" v-model="form.startDate" required />
          </div>
          <div class="form-group">
            <label for="perjalanan-selesai">Tanggal Selesai</label>
            <input type="date" id="perjalanan-selesai" v-model="form.endDate" required />
          </div>
        </div>
        <div class="form-group">
          <label for="perjalanan-tipe">Jenis Perjalanan Bisnis</label>
          <select id="perjalanan-tipe" v-model="form.type" required>
            <option value="" disabled selected>Pilih Jenis Perjalanan</option>
            <option v-for="type in businessTripTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="perjalanan-aktivitas">Tujuan</label>
          <textarea
            id="perjalanan-aktivitas"
            rows="5"
            v-model="form.activity"
            required
          ></textarea>
        </div>
        <button type="submit" class="submit-button">Ajukan Perjalanan</button>
      </form>

      <div class="history-widget">
        <div class="widget-header">
          <h3>Riwayat Pengajuan Perjalanan Bisnis</h3>
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari Riwayat..."
              class="search-input"
            />
            <button class="btn-search">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        <table class="history-table">
          <thead>
            <tr>
              <th>Tanggal Mulai</th>
              <th>Tanggal Selesai</th>
              <th>Tujuan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredHistory" :key="index">
              <td>{{ formatDate(item.startDate) }}</td>
              <td>{{ formatDate(item.endDate) }}</td>
              <td>{{ item.activity }}</td>
              <td>
                <span :class="['status-tag', item.statusClass]">{{ item.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </Layout>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import Layout from '@/Layout.vue'

const openSuccessModal = inject('openSuccessModal')
const formatDate = inject('formatDate')
const businessTripTypes = inject('businessTripTypes')
const searchQuery = ref('')

const form = ref({
  activity: '',
  startDate: '',
  endDate: '',
  type: '',
})

const history = ref([
  {
    startDate: '2025-09-20',
    endDate: '2025-09-25',
    activity: 'Rapat koordinasi manajemen regional - Pontianak',
    status: 'Disetujui',
    statusClass: 'status-approved',
  },
  {
    startDate: '2025-10-15',
    endDate: '2025-10-20',
    activity: 'Inspeksi Kualitas Hasil Panen - Sanggau',
    status: 'Disetujui',
    statusClass: 'status-approved',
  },
  {
    startDate: '2025-11-11',
    endDate: '2025-11-13',
    activity: 'Pelatihan Manajemen Mutu Panen - Medan',
    status: 'Menunggu',
    statusClass: 'status-pending',
  },
])

const filteredHistory = computed(() => {
  if (!searchQuery.value) {
    return history.value
  }
  const query = searchQuery.value.toLowerCase()
  return history.value.filter((item) => {
    const activityMatch = item.activity.toLowerCase().includes(query)
    const startMatch = formatDate(item.startDate).toLowerCase().includes(query)
    const endMatch = formatDate(item.endDate).toLowerCase().includes(query)
    return activityMatch || startMatch || endMatch
  })
})

const submitBusinessTrip = () => {
  history.value.unshift({
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    activity: form.value.activity,
    type: form.value.type,
    status: 'Menunggu',
    statusClass: 'status-pending',
  })

  if (openSuccessModal) {
    openSuccessModal(() => {
      form.value.activity = ''
      form.value.startDate = ''
      form.value.endDate = ''
      form.value.type = ''
    })
  } else {
    form.value.activity = ''
    form.value.startDate = ''
    form.value.endDate = ''
    form.value.type = ''
  }
}
</script>

<style scoped>
.content-section {
  display: block;
}

.history-widget {
  margin-top: 40px;
  background-color: var(--white);
  padding: 25px;
  border-radius: 16px;
  box-shadow: var(--shadow);
}
</style>
