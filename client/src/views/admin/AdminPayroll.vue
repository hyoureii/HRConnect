<template>
  <MainLayout>
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
          <textarea
            id="reimburse-kegiatan"
            rows="5"
            v-model="form.activity"
            required
          ></textarea>
        </div>
        <button type="submit" class="submit-button">Ajukan Reimburse</button>
      </form>

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
              <th>Nama Pemohon</th>
              <th>Jenis</th>
              <th>Keterangan</th>
              <th>Nominal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredHistory" :key="index">
              <td>{{ item.requesterName }}</td>
              <td>{{ item.reimbursementType }}</td>
              <td>{{ item.activity }}</td>
              <td>{{ formatCurrency(item.amount) }}</td>
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
import { reimbursementTypes } from '../../../lib/types'

const openSuccessModal = inject('openSuccessModal') as (message?: string) => void
const formatCurrency = inject('formatCurrency') as (value: number) => string
const formatDate = inject('formatDate') as (date: string) => string
const searchQuery = ref('')

const form = ref({
  activity: '',
  date: '',
  amount: '',
  type: '',
})

const history = ref([])
const isLoading = ref(false)

onMounted(async () => {
  await fetchReimbursements()
})

const fetchReimbursements = async () => {
  isLoading.value = true
  try {
    const result = await client.api.reimburse.get()
    if (result.data) {
      history.value = result.data.map(item => ({
        id: item.id,
        date: item.date,
        activity: item.description,
        amount: item.amount,
        status: item.status === 'approved' ? 'Disetujui' : 'Menunggu',
        statusClass: item.status === 'approved' ? 'status-approved' : 'status-pending',
        requesterName: item.requesterName,
        reimbursementType: item.type,
      }))
    }
  } catch (err) {
    console.error('Error fetching reimbursements:', err)
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
    const dateStr = item.date.toLowerCase()
    const formattedDateStr = formatDate(item.date).toLowerCase()
    return dateStr.includes(query) || formattedDateStr.includes(query)
  })
})

const submitReimbursement = async () => {
  try {
    await client.api.reimburse.post({
      type: form.value.type,
      description: form.value.activity,
      date: form.value.date,
      amount: Number(form.value.amount),
    })

    await fetchReimbursements()
    form.value = { activity: '', date: '', amount: '', type: '' }
    openSuccessModal('Pengajuan reimburse berhasil!')
  } catch (err) {
    console.error('Error submitting reimbursement:', err)
  }
}

const handleApprove = async (id: number, action: string) => {
  try {
    await client.api.reimburse[':id']({ id }).put({ status: action })
    await fetchReimbursements()
    openSuccessModal(`Pengajuan berhasil ${action === 'approved' ? 'disetujui' : 'ditolak'}!`)
  } catch (err) {
    console.error('Error updating reimbursement:', err)
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
