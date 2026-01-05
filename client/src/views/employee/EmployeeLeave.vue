<template>
  <Layout>
    <section id="pengajuan-cuti" class="content-section">
      <form class="card-form" @submit.prevent="submitLeave">
        <h2>Formulir Pengajuan Cuti</h2>
        <div class="form-group-row">
          <div class="form-group">
            <label for="cuti-mulai">Tanggal Mulai Cuti</label>
            <input type="date" id="cuti-mulai" v-model="startDate" required />
          </div>
          <div class="form-group">
            <label for="cuti-selesai">Tanggal Selesai Cuti</label>
            <input type="date" id="cuti-selesai" v-model="endDate" required />
          </div>
        </div>
        <div class="form-group">
          <label for="cuti-tipe">Jenis Cuti</label>
          <select id="cuti-tipe" v-model="leaveType" required>
            <option value="" disabled selected>Pilih Jenis Cuti</option>
            <option v-for="type in leaveTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="cuti-alasan">Keterangan Tambahan</label>
          <textarea id="cuti-alasan" rows="5" v-model="reason" required></textarea>
        </div>
        <button type="submit" class="submit-button">Ajukan Cuti</button>
      </form>

      <div class="history-widget">
        <div class="widget-header">
          <h3>Riwayat Pengajuan Cuti</h3>
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari Riwayat Cuti"
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
              <th>Jenis Cuti</th>
              <th>Keterangan Tambahan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody v-if="!isLoading">
            <tr v-for="(item, index) in filteredHistory" :key="index">
              <td>{{ item.startDate ? new Date(item.startDate).toLocaleDateString('id-ID') : '' }}</td>
              <td>{{ item.endDate ? new Date(item.endDate).toLocaleDateString('id-ID') : '' }}</td>
              <td>{{ item.leaveType }}</td>
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
              <td colspan="5" style="text-align: center; padding: 20px;">Loading...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import Layout from '@/Layout.vue'
import { client } from '@/utils/client'
import { leaveTypes } from '@/utils/types'

const openSuccessModal = inject('openSuccessModal')
const searchQuery = ref('')
const leaveType = ref('')
const reason = ref('')
const startDate = ref('')
const endDate = ref('')
const isLoading = ref(false)
const error = ref('')

const leaveHistory = ref([])

onMounted(async () => {
  isLoading.value = true
  error.value = ''
  try {
    const result = await client.api.leaveRequests.get()
    if (result.data) {
      leaveHistory.value = result.data
    }
  } catch (err) {
    console.error('Error fetching leave requests:', err)
    error.value = 'Failed to load leave requests'
  } finally {
    isLoading.value = false
  }
})

const filteredHistory = computed(() => {
  if (!searchQuery.value) {
    return leaveHistory.value
  }
  const query = searchQuery.value.toLowerCase()
  return leaveHistory.value.filter((item) => {
    const startStr = item.startDate ? new Date(item.startDate).toLocaleDateString('id-ID') : ''
    const endStr = item.endDate ? new Date(item.endDate).toLocaleDateString('id-ID') : ''
    return startStr.toLowerCase().includes(query) || endStr.toLowerCase().includes(query)
  })
})

const submitLeave = async () => {
  try {
    await client.api.leaveRequests.post({
      leaveType: leaveType.value,
      description: reason.value,
      startDate: startDate.value,
      endDate: endDate.value,
    })

    // Refetch data
    const result = await client.api.leaveRequests.get()
    if (result.data) {
      leaveHistory.value = result.data
    }

    openSuccessModal(() => {
      leaveType.value = ''
      reason.value = ''
      startDate.value = ''
      endDate.value = ''
    })
  } catch (err) {
    console.error('Error submitting leave request:', err)
    error.value = 'Failed to submit leave request'
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
