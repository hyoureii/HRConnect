<template>
  <MainLayout>
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
          <h3>Daftar Pengajuan Cuti Karyawan</h3>
          <div class="search-box">
            <input
              type="text"
              v-model="requestSearchQuery"
              placeholder="Cari Daftar Pengajuan"
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
              <th>Tanggal Mulai</th>
              <th>Tanggal Selesai</th>
              <th>Jenis Cuti</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody v-if="!isLoadingRequests">
            <tr v-for="request in filteredLeaveRequests" :key="request.id">
              <td>{{ request.requesterName }}</td>
              <td>{{ request.startDate ? new Date(request.startDate).toLocaleDateString('id-ID') : '' }}</td>
              <td>{{ request.endDate ? new Date(request.endDate).toLocaleDateString('id-ID') : '' }}</td>
              <td>{{ request.leaveType }}</td>
              <td>{{ request.description }}</td>
              <td>
                <div v-if="request.status === 'pending'" class="action-buttons">
                  <button
                    class="action-btn approve-btn"
                    @click="openConfirmModal(request.id, 'approve')"
                    title="Terima Pengajuan"
                  >
                    <i class="fa-solid fa-check"></i>
                  </button>
                  <button
                    class="action-btn reject-btn"
                    @click="openConfirmModal(request.id, 'reject')"
                    title="Tolak Pengajuan"
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
                >
                  {{ request.status === 'approved' ? 'Disetujui' : 'Ditolak' }}
                </span>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6" style="text-align: center; padding: 20px;">Loading...</td>
            </tr>
          </tbody>
        </table>
      </div>

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
          <tbody v-if="!isLoadingHistory">
            <tr v-for="(item, index) in filteredHistory" :key="index">
              <td>{{ item.startDate ? new Date(item.startDate).toLocaleDateString('id-ID') : '' }}</td>
              <td>{{ item.endDate ? new Date(item.endDate).toLocaleDateString('id-ID') : '' }}</td>
              <td>{{ item.leaveType }}</td>
              <td>{{ item.description }}</td>
              <td>
                <span :class="[
                  'status-tag',
                  item.status === 'approved' ? 'status-approved' : 'status-rejected'
                ]">
                  {{ item.status === 'approved' ? 'Disetujui' : 'Ditolak' }}
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
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import MainLayout from '@/MainLayout.vue'
import { client } from '../../../lib/client'
import { leaveTypes } from '../../../lib/types'

const openSuccessModal = inject('openSuccessModal') as (message?: string) => void
const searchQuery = ref('')
const requestSearchQuery = ref('')
const isLoadingRequests = ref(false)
const isLoadingHistory = ref(false)
const error = ref('')
const showConfirmModal = ref(false)
const confirmAction = ref('')
const confirmTitle = ref('')
const confirmMessage = ref('')
const selectedRequestId = ref<number | null>(null)

const leaveType = ref('')
const reason = ref('')
const startDate = ref('')
const endDate = ref('')

const leaveRequests = ref([])
const leaveHistory = ref([])

onMounted(async () => {
  await fetchLeaveRequests()
  await fetchLeaveHistory()
})

const fetchLeaveRequests = async () => {
  isLoadingRequests.value = true
  error.value = ''
  try {
    const result = await client.api.leave.get()
    if (result.data) {
      leaveRequests.value = result.data.filter(req => req.status === 'pending')
    }
  } catch (err) {
    console.error('Error fetching leave requests:', err)
    error.value = 'Failed to load leave requests'
  } finally {
    isLoadingRequests.value = false
  }
}

const fetchLeaveHistory = async () => {
  isLoadingHistory.value = true
  try {
    const result = await client.api.leave.get()
    if (result.data) {
      leaveHistory.value = result.data.filter(req => req.status !== 'pending')
    }
  } catch (err) {
    console.error('Error fetching leave history:', err)
  } finally {
    isLoadingHistory.value = false
  }
}

const filteredLeaveRequests = computed(() => {
  if (!requestSearchQuery.value) {
    return leaveRequests.value
  }
  const query = requestSearchQuery.value.toLowerCase()
  return leaveRequests.value.filter(
    (item) =>
      item.requesterName?.toLowerCase().includes(query) ||
      item.leaveType?.toLowerCase().includes(query) ||
      item.startDate?.toLowerCase().includes(query) ||
      item.endDate?.toLowerCase().includes(query),
  )
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
    await client.api.leave.post({
      leaveType: leaveType.value,
      description: reason.value,
      startDate: startDate.value,
      endDate: endDate.value,
    })

    // Refetch data
    const result = await client.api.leave.get()
    if (result.data) {
      leaveHistory.value = result.data.filter(req => req.status !== 'pending')
    }

    openSuccessModal('Pengajuan cuti berhasil!')
    leaveType.value = ''
    reason.value = ''
    startDate.value = ''
    endDate.value = ''
  } catch (err) {
    console.error('Error submitting leave request:', err)
    error.value = 'Failed to submit leave request'
  }
}

const openConfirmModal = (id, action) => {
  selectedRequestId.value = id
  confirmAction.value = action
  showConfirmModal.value = true

  if (action === 'approve') {
    confirmTitle.value = 'Setujui Pengajuan?'
    confirmMessage.value = 'Apakah Anda yakin ingin menyetujui pengajuan cuti ini?'
  } else {
    confirmTitle.value = 'Tolak Pengajuan?'
    confirmMessage.value = 'Apakah Anda yakin ingin menolak pengajuan cuti ini?'
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
    await client.api.leave[':id']({ id: selectedRequestId.value }).put({ status })

    // Refetch data
    await fetchLeaveRequests()
    await fetchLeaveHistory()
    closeConfirmModal()
    openSuccessModal('Pengajuan berhasil diperbarui!')
  } catch (err) {
    console.error('Error updating leave request:', err)
    error.value = 'Failed to update leave request'
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
  transition: transform 0.2s, box-shadow 0.2s;
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
  transition: opacity 0.3s ease, visibility 0.3s ease;
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
