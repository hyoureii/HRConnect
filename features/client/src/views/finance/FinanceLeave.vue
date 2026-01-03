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
          <tbody>
            <tr v-for="(item, index) in filteredHistory" :key="index">
              <td>{{ item.start }}</td>
              <td>{{ item.end }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.reason }}</td>
              <td>
                <span :class="['status-tag', item.statusClass]">
                  {{ item.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import Layout from '@/Layout.vue'

const openSuccessModal = inject('openSuccessModal')
const leaveTypes = inject('leaveTypes')
const searchQuery = ref('')
const leaveType = ref('')
const reason = ref('')
const startDate = ref('')
const endDate = ref('')

const leaveHistory = ref([
  {
    start: '15 Agu 2025',
    end: '18 Agu 2025',
    type: 'Cuti Sakit',
    reason: 'Sakit',
    status: 'Disetujui',
    statusClass: 'status-approved',
  },
  {
    start: '01 Des 2025',
    end: '02 Des 2025',
    type: 'Cuti Penting',
    reason: 'Keperluan keluarga',
    status: 'Menunggu',
    statusClass: 'status-pending',
  },
])

const filteredHistory = computed(() => {
  if (!searchQuery.value) {
    return leaveHistory.value
  }
  const query = searchQuery.value.toLowerCase()
  return leaveHistory.value.filter(
    (item) => item.start.toLowerCase().includes(query) || item.end.toLowerCase().includes(query),
  )
})

const submitLeave = () => {
  console.log('Mengajukan cuti:', {
    leaveType: leaveType.value,
    reason: reason.value,
    startDate: startDate.value,
    endDate: endDate.value,
  })

  leaveHistory.value.unshift({
    start: startDate.value,
    end: endDate.value,
    type: leaveType.value,
    reason: reason.value,
    status: 'Menunggu',
    statusClass: 'status-pending',
  })

  openSuccessModal(() => {
    leaveType.value = ''
    reason.value = ''
    startDate.value = ''
    endDate.value = ''
  })
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
