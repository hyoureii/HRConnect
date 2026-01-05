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
          <h3>Daftar Pengajuan Perjalanan Bisnis Karyawan</h3>
          <div class="search-box">
            <input
              type="text"
              v-model="requestSearchQuery"
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
              <th>Nama Karyawan</th>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th>Tujuan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody v-if="!isLoadingRequests">
            <tr v-for="request in filteredBusinessTripRequests" :key="request.id">
              <td>{{ request.requesterName }}</td>
              <td>{{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}</td>
              <td>{{ request.tripType }}</td>
              <td>{{ request.description }}</td>
              <td>
                <div v-if="request.status === 'pending'" class="action-buttons">
                  <button
                    class="action-btn approve-btn"
                    @click="openConfirmModal(request.id, 'approve')"
                    title="Setujui"
                  >
                    <i class="fa-solid fa-check"></i>
                  </button>
                  <button
                    class="action-btn reject-btn"
                    @click="openConfirmModal(request.id, 'reject')"
                    title="Tolak"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <span
                  v-else
                  :class="[
                    'status-tag',
                    request.status === 'approved' ? 'status-approved' : 'status-rejected',
                  ]"
                  >{{ request.status === 'approved' ? 'Disetujui' : 'Ditolak' }}</span
                >
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
          <tbody v-if="!isLoadingHistory">
            <tr v-for="(item, index) in filteredHistory" :key="index">
              <td>{{ formatDate(item.startDate) }}</td>
              <td>{{ formatDate(item.endDate) }}</td>
              <td>{{ item.description }}</td>
              <td>
                <span :class="[
                  'status-tag',
                  item.status === 'approved' ? 'status-approved' : 'status-rejected'
                ]">{{ item.status === 'approved' ? 'Disetujui' : 'Ditolak' }}</span>
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

    <div id="confirm-modal" class="modal-overlay" :class="{ show: showConfirmModal }">
      <div class="modal-content">
        <div class="modal-icon">
          <i
            class="fa-solid"
            :class="confirmAction === 'approve' ? 'fa-circle-check' : 'fa-circle-xmark'"
            :style="{
              color: confirmAction === 'approve' ? 'var(--success-green)' : 'var(--danger-red)',
            }"
          ></i>
        </div>
        <h2>{{ confirmTitle }}</h2>
        <p>{{ confirmMessage }}</p>
        <div class="modal-actions">
          <button class="btn-confirm-yes" @click="handleConfirmAction">
            Ya, {{ confirmAction === 'approve' ? 'Setujui' : 'Tolak' }}
          </button>
          <button class="btn-confirm-no" @click="closeConfirmModal">Batalkan</button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import Layout from '@/Layout.vue'

const openSuccessModal = inject('openSuccessModal')
const formatDate = inject('formatDate')
const businessTripTypes = inject('businessTripTypes')
const searchQuery = ref('')
const requestSearchQuery = ref('')

const showConfirmModal = ref(false)
const confirmAction = ref('')
const confirmTitle = ref('')
const confirmMessage = ref('')
const selectedRequestId = ref(null)

const form = ref({
  activity: '',
  startDate: '',
  endDate: '',
  type: '',
})

const businessTripRequests = ref([])
const isLoadingRequests = ref(false)
const isLoadingHistory = ref(false)
const error = ref('')

onMounted(async () => {
  await fetchTripRequests()
  await fetchTripHistory()
})

const fetchTripRequests = async () => {
  isLoadingRequests.value = true
  error.value = ''
  try {
    const result = await client.api.trips.get()
    if (result.data) {
      businessTripRequests.value = result.data.filter(req => req.status === 'pending')
    }
  } catch (err) {
    console.error('Error fetching trip requests:', err)
    error.value = 'Failed to load trip requests'
  } finally {
    isLoadingRequests.value = false
  }
}

const fetchTripHistory = async () => {
  isLoadingHistory.value = true
  try {
    const result = await client.api.trips.get()
    if (result.data) {
      history.value = result.data.filter(req => req.status !== 'pending')
    }
  } catch (err) {
    console.error('Error fetching trip history:', err)
  } finally {
    isLoadingHistory.value = false
  }
}

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

const filteredBusinessTripRequests = computed(() => {
  if (!requestSearchQuery.value) {
    return businessTripRequests.value
  }
  const query = requestSearchQuery.value.toLowerCase()
  return businessTripRequests.value.filter((item) => {
    return (
      item.employeeName.toLowerCase().includes(query) ||
      item.activity.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    )
  })
})

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

const openConfirmModal = (id, action) => {
  selectedRequestId.value = id
  confirmAction.value = action
  showConfirmModal.value = true

  if (action === 'approve') {
    confirmTitle.value = 'Setujui Perjalanan Bisnis?'
    confirmMessage.value = 'Apakah Anda yakin ingin menyetujui pengajuan perjalanan bisnis ini?'
  } else {
    confirmTitle.value = 'Tolak Perjalanan Bisnis?'
    confirmMessage.value = 'Apakah Anda yakin ingin menolak pengajuan perjalanan bisnis ini?'
  }
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  selectedRequestId.value = null
  confirmAction.value = ''
}

const handleConfirmAction = async () => {
  const status = confirmAction.value === 'approve' ? 'approved' : 'refused'

  try {
    await client.api.trips[':id']({ id: selectedRequestId.value }).put({ status })

    // Refetch data
    await fetchTripRequests()
    await fetchTripHistory()
    closeConfirmModal()
  } catch (err) {
    console.error('Error updating trip request:', err)
    error.value = 'Failed to update trip request'
    closeConfirmModal()
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

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.approve-btn {
  background-color: var(--success-green);
}

.reject-btn {
  background-color: var(--danger-red);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
}

.modal-overlay.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background-color: var(--white);
  padding: 30px 40px;
  border-radius: 15px;
  text-align: center;
  width: 90%;
  max-width: 380px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.modal-overlay.show .modal-content {
  transform: scale(1);
}

.modal-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-confirm-yes {
  background-color: var(--primary-blue);
  color: white;
}
.btn-confirm-yes:hover {
  background-color: #0052cc;
}

.btn-confirm-no {
  background-color: #e0e0e0;
  color: #333;
}
.btn-confirm-no:hover {
  background-color: #d0d0d0;
}
</style>
