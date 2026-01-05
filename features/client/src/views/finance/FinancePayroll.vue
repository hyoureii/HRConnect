<template>
  <div class="page-container">
    <aside class="sidebar">
      <h1 class="app-name">HRConnect</h1>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/finance/dashboard" class="menu-item">
            <i class="fa-solid fa-tachograph-digital"></i> Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/finance/leave" class="menu-item">
            <i class="fa-solid fa-calendar-alt"></i> Cuti
          </router-link>
        </li>
        <li>
          <router-link to="/finance/payroll" class="menu-item active">
            <i class="fa-solid fa-file-invoice-dollar"></i> Payroll
          </router-link>
        </li>
        <li>
          <router-link to="/finance/business-trip" class="menu-item">
            <i class="fa-solid fa-plane-departure"></i> Perjalanan Bisnis
          </router-link>
        </li>
      </ul>
    </aside>

    <div class="main-content">
      <nav class="navbar">
        <div class="navbar-title">Reimbursement</div>
        <a href="#" class="logout-button" @click.prevent="openLogoutModal">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </a>
      </nav>

       <main class="content-area">
         <section id="payroll" class="content-section">
           <div class="history-widget">
            <div class="widget-header">
              <h3>Daftar Pengajuan Reimburse Masuk</h3>
              <div class="search-box">
                <input
                  type="text"
                  v-model="requestSearchQuery"
                  placeholder="Cari Reimburse Masuk"
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
                  placeholder="Cari Riwayat Pengajuan"
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
               <tbody v-if="!isLoadingHistory">
                 <tr v-for="(item, index) in filteredHistory" :key="index">
                   <td>{{ formatDate(item.date) }}</td>
                   <td>{{ item.description }}</td>
                   <td>{{ formatCurrency(item.amount) }}</td>
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
      </main>
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
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue'
import { client } from '@/utils/client'

const openLogoutModal = inject('openLogoutModal')
const formatDate = inject('formatDate')
const formatCurrency = inject('formatCurrency')
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page-container {
  font-family: 'Poppins', sans-serif;
  background-color: var(--light-grey-bg);
  color: var(--dark-text);
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  background-color: var(--dark-text);
  color: var(--white);
  padding: 20px;
}

.app-name {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  padding: 10px 0;
  margin-bottom: 30px;
  color: var(--white);
}

.sidebar-menu {
  list-style: none;
}

.sidebar-menu li {
  margin-bottom: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--grey-text);
  font-weight: 500;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--white);
}

.menu-item.active {
  background-color: var(--primary-blue);
  color: var(--white);
}

.menu-item i {
  width: 20px;
  text-align: center;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: var(--white);
  border-bottom: 1px solid var(--border-color);
}

.navbar-title {
  font-size: 22px;
  font-weight: 600;
}

.logout-button {
  text-decoration: none;
  color: var(--grey-text);
  font-weight: 500;
  transition: color 0.3s;
}

.logout-button:hover {
  color: var(--primary-blue);
}

.content-area {
  padding: 40px;
  overflow-y: auto;
}

.content-section {
  display: block;
}

.card-form {
  background-color: var(--white);
  padding: 30px;
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.card-form h2 {
  margin-top: 0;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.form-group-row .form-group {
  flex-grow: 1;
  margin-bottom: 0;
}

.card-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.card-form input[type='text'],
.card-form input[type='date'],
.card-form input[type='number'],
.card-form textarea,
.card-form select {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  background-color: var(--white);
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.card-form input:focus,
.card-form textarea:focus,
.card-form select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.submit-button {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-blue);
  color: var(--white);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #0052cc;
}

.history-widget {
  margin-top: 40px;
  background-color: var(--white);
  padding: 25px;
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.widget-header h3 {
  margin-top: 0;
  margin-bottom: 0;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  color: var(--dark-text);
  outline: none;
  width: 200px;
}

.search-input:focus {
  border-color: var(--primary-blue);
}

.btn-search {
  background-color: var(--primary-blue);
  color: var(--white);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-search:hover {
  background-color: #0052cc;
}

.history-widget h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

.history-table th,
.history-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.history-table thead th {
  background-color: var(--light-grey-bg);
  font-weight: 600;
  color: var(--dark-text);
}

.history-table tbody tr:last-child td {
  border-bottom: none;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  display: inline-block;
}

.status-approved {
  background-color: #d4efdf;
  color: var(--success-green);
}

.status-pending {
  background-color: #fdebd0;
  color: var(--warning-orange);
}

.status-rejected {
  background-color: #f8d7da;
  color: var(--danger-red);
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
