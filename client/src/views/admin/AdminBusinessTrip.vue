<template>
  <MainLayout>
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
              <th>Nama Pemohon</th>
              <th>Jenis</th>
              <th>Tujuan</th>
              <th>Tanggal Mulai</th>
              <th>Tanggal Selesai</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredHistory" :key="index">
              <td>{{ item.requesterName }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.activity }}</td>
              <td>{{ formatDate(item.startDate) }}</td>
              <td>{{ formatDate(item.endDate) }}</td>
              <td>
                <span :class="['status-tag', item.statusClass]">{{ item.status }}</span>
              </td>
              <td>
                <div v-if="item.status === 'Menunggu'" class="action-buttons">
                  <button class="action-btn approve-btn" @click="handleApprove(item.id, 'approved')" title="Terima">
                    <i class="fa-solid fa-check"></i>
                  </button>
                  <button class="action-btn reject-btn" @click="handleApprove(item.id, 'rejected')" title="Tolak">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import MainLayout from '@/MainLayout.vue'
import { client } from '../../../lib/client'
import { businessTripTypes } from '../../../lib/types'

const openSuccessModal = inject('openSuccessModal') as (message?: string) => void
const formatDate = inject('formatDate') as (date: string) => string
const searchQuery = ref('')

const form = ref({
  activity: '',
  startDate: '',
  endDate: '',
  type: '',
})

const history = ref([])
const isLoading = ref(false)

onMounted(async () => {
  await fetchTrips()
})

const fetchTrips = async () => {
  isLoading.value = true
  try {
    const result = await client.api.trips.get()
    if (result.data) {
      history.value = result.data.map(item => ({
        id: item.id,
        startDate: item.startDate,
        endDate: item.endDate,
        activity: item.description,
        status: item.status === 'approved' ? 'Disetujui' : 'Menunggu',
        statusClass: item.status === 'approved' ? 'status-approved' : 'status-pending',
        type: item.tripType,
        requesterName: item.requesterName,
      }))
    }
  } catch (err) {
    console.error('Error fetching trips:', err)
  } finally {
    isLoading.value = false
  }
}

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

const submitBusinessTrip = async () => {
  try {
    await client.api.trips.post({
      tripType: form.value.type,
      description: form.value.activity,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
    })

    await fetchTrips()
    form.value = { activity: '', startDate: '', endDate: '', type: '' }
    openSuccessModal('Pengajuan perjalanan bisnis berhasil!')
  } catch (err) {
    console.error('Error submitting business trip:', err)
  }
}

const handleApprove = async (id: number, action: string) => {
  try {
    await client.api.trips[':id']({ id }).put({ status: action })
    await fetchTrips()
    openSuccessModal(`Pengajuan berhasil ${action === 'approved' ? 'disetujui' : 'ditolak'}!`)
  } catch (err) {
    console.error('Error updating trip:', err)
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
