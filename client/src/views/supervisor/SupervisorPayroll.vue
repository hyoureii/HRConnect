<template>
  <Layout>
    <section id="payroll" class="content-section">
      <form class="card-form" @submit.prevent="submitReimbursement">
        <h2>Formulir Pengajuan Reimburse</h2>
        <div class="form-group-row">
          <div class="form-group">
            <label for="reimburse-tanggal">Tanggal Transaksi</label>
            <input type="date" id="reimburse-tanggal" v-model="form.date" required />
          </div>
          <div class="form-group">
            <label for="reimburse-nominal">Nominal (Rp)</label>
            <input type="number" id="reimburse-nominal" v-model="form.amount" required />
          </div>
        </div>
        <div class="form-group">
          <label for="reimburse-type">Jenis Reimburse</label>
          <select id="reimburse-type" v-model="form.type" required>
            <option value="" disabled selected>Pilih Jenis Reimburse</option>
            <option value="Reimburse Kesehatan">Reimburse Kesehatan</option>
            <option value="Reimburse Perjalanan Dinas">Reimburse Perjalanan Dinas</option>
            <option value="Reimburse Operasional Kerja">Reimburse Operasional Kerja</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <div class="form-group">
          <label for="reimburse-kegiatan">Keterangan Tambahan</label>
          <textarea id="reimburse-kegiatan" rows="5" v-model="form.activity" required></textarea>
        </div>
        <button type="submit" class="submit-button">Ajukan Reimburse</button>
      </form>

      <div class="history-widget">
        <div class="widget-header">
          <h3>Daftar Pengajuan Reimburse Karyawan</h3>
          <div class="search-box">
            <input
              type="text"
              v-model="requestSearchQuery"
              placeholder="Cari Reimburse Karyawan"
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
              <th>Keterangan</th>
              <th>Nominal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody v-if="!isLoadingRequests">
            <tr v-for="request in filteredReimbursementRequests" :key="request.id">
              <td>{{ request.requesterName }}</td>
              <td>{{ formatDate(request.date) }}</td>
              <td>{{ request.reimbursementType }}</td>
              <td>{{ request.description }}</td>
              <td>{{ formatCurrency(request.amount) }}</td>
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
          <h3>Riwayat Pengajuan Reimburse</h3>
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari Riwayat Reimburse"
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
              <th>Tanggal Transaksi</th>
              <th>Keterangan</th>
              <th>Nominal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredHistory" :key="index">
              <td>{{ formatDate(item.date) }}</td>
              <td>{{ item.activity }}</td>
              <td>{{ formatCurrency(item.amount) }}</td>
              <td>
                <span :class="['status-tag', item.statusClass]">{{ item.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Konfirmasi Aksi -->
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
  </Layout>
</template>

<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue'
import Layout from '@/Layout.vue'
import { client } from '@/utils/client'
import { reimbursementTypes } from '@/utils/types'

const formatDate = inject('formatDate')
const formatCurrency = inject('formatCurrency')
const openSuccessModal = inject('openSuccessModal')
const searchQuery = ref('')
const requestSearchQuery = ref('')
const isLoadingRequests = ref(false)
const isLoadingHistory = ref(false)
const error = ref('')
const showConfirmModal = ref(false)
const confirmAction = ref('')
const confirmTitle = ref('')
const confirmMessage = ref('')
const selectedRequestId = ref(null)

const form = ref({
  activity: '',
  date: '',
  amount: '',
  type: '',
})

const reimbursementRequests = ref([])
const history = ref([])

onMounted(async () => {
  await fetchReimbursementRequests()
  await fetchReimbursementHistory()
})

const fetchReimbursementRequests = async () => {
  isLoadingRequests.value = true
  error.value = ''
  try {
    const result = await client.api.reimbursements.get()
    if (result.data) {
      reimbursementRequests.value = result.data.filter(req => req.status === 'pending')
    }
  } catch (err) {
    console.error('Error fetching reimbursement requests:', err)
    error.value = 'Failed to load reimbursement requests'
  } finally {
    isLoadingRequests.value = false
  }
}

const fetchReimbursementHistory = async () => {
  isLoadingHistory.value = true
  try {
    const result = await client.api.reimbursements.get()
    if (result.data) {
      history.value = result.data.filter(req => req.status !== 'pending')
    }
  } catch (err) {
    console.error('Error fetching reimbursement history:', err)
  } finally {
    isLoadingHistory.value = false
  }
}

const filteredReimbursementRequests = computed(() => {
  if (!requestSearchQuery.value) {
    return reimbursementRequests.value
  }
  const query = requestSearchQuery.value.toLowerCase()
  return reimbursementRequests.value.filter((item) => {
    return (
      item.requesterName?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.reimbursementType?.toLowerCase().includes(query)
    )
  })
})

const filteredHistory = computed(() => {
  if (!searchQuery.value) {
    return history.value
  }
  const query = searchQuery.value.toLowerCase()
  return history.value.filter((item) => {
    const dateStr = item.date ? item.date.toLowerCase() : ''
    const formattedDateStr = item.date ? formatDate(item.date).toLowerCase() : ''
    return dateStr.includes(query) || formattedDateStr.includes(query)
  })
})

const submitReimbursement = async () => {
  try {
    await client.api.reimbursements.post({
      reimbursementType: form.value.type,
      description: form.value.activity,
      date: form.value.date,
      amount: form.value.amount,
    })

    // Refetch data
    const result = await client.api.reimbursements.get()
    if (result.data) {
      history.value = result.data.filter(req => req.status !== 'pending')
    }

    if (openSuccessModal) {
      openSuccessModal(() => {
        form.value.activity = ''
        form.value.date = ''
        form.value.amount = ''
        form.value.type = ''
      })
    } else {
      form.value.activity = ''
      form.value.date = ''
      form.value.amount = ''
      form.value.type = ''
    }
  } catch (err) {
    console.error('Error submitting reimbursement:', err)
    error.value = 'Failed to submit reimbursement request'
  }
}

const openConfirmModal = (id, action) => {
  selectedRequestId.value = id
  confirmAction.value = action
  showConfirmModal.value = true

  if (action === 'approve') {
    confirmTitle.value = 'Setujui Reimburse?'
    confirmMessage.value = 'Apakah Anda yakin ingin menyetujui pengajuan reimburse ini?'
  } else {
    confirmTitle.value = 'Tolak Reimburse?'
    confirmMessage.value = 'Apakah Anda yakin ingin menolak pengajuan reimburse ini?'
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
    await client.api.reimbursements[':id']({ id: selectedRequestId.value }).put({ status })

    // Refetch data
    await fetchReimbursementRequests()
    await fetchReimbursementHistory()
    closeConfirmModal()
  } catch (err) {
    console.error('Error updating reimbursement request:', err)
    error.value = 'Failed to update reimbursement request'
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
