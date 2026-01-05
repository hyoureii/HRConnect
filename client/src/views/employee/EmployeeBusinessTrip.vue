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
          <textarea id="perjalanan-aktivitas" rows="5" v-model="form.activity" required></textarea>
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
              placeholder="Cari Riwayat Perjalanan"
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
          <tbody v-if="!isLoading">
            <tr v-for="(item, index) in filteredHistory" :key="index">
              <td>{{ formatDate(item.startDate) }}</td>
              <td>{{ formatDate(item.endDate) }}</td>
              <td>{{ item.description }}</td>
              <td>
                <span :class="[
                  'status-tag',
                  item.status === 'approved' ? 'status-approved' :
                  item.status === 'refused' ? 'status-rejected' : 'status-pending'
                ]">
                  {{ item.status === 'approved' ? 'Disetujui' :
                     item.status === 'refused' ? 'Ditolak' : 'Menunggu' }}
                </span>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="4" style="text-align: center; padding: 20px;">Loading...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </Layout>
</template>

<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue'
import Layout from '@/Layout.vue'
import { client } from '@/utils/client'
import { businessTripTypes } from '@/utils/types'

const openSuccessModal = inject('openSuccessModal')
const formatDate = inject('formatDate')
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref('')

const form = ref({
  activity: '',
  startDate: '',
  endDate: '',
  type: '',
})

const history = ref([])

onMounted(async () => {
  isLoading.value = true
  error.value = ''
  try {
    const result = await client.api.trips.get()
    if (result.data) {
      history.value = result.data
    }
  } catch (err) {
    console.error('Error fetching trips:', err)
    error.value = 'Failed to load business trips'
  } finally {
    isLoading.value = false
  }
})

const filteredHistory = computed(() => {
  if (!searchQuery.value) {
    return history.value
  }
  const query = searchQuery.value.toLowerCase()
  return history.value.filter((item) => {
    const activityMatch = item.description?.toLowerCase().includes(query) || false
    const startMatch = item.startDate ? formatDate(item.startDate).toLowerCase().includes(query) : false
    const endMatch = item.endDate ? formatDate(item.endDate).toLowerCase().includes(query) : false
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

    // Refetch data
    const result = await client.api.trips.get()
    if (result.data) {
      history.value = result.data
    }

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
  } catch (err) {
    console.error('Error submitting business trip:', err)
    error.value = 'Failed to submit business trip request'
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
