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
    </section>
  </Layout>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import Layout from '@/Layout.vue'

const openSuccessModal = inject('openSuccessModal')
const formatCurrency = inject('formatCurrency')
const formatDate = inject('formatDate')
const searchQuery = ref('')

const form = ref({
  activity: '',
  date: '',
  amount: '',
  type: '',
})

const history = ref([
  {
    date: '2025-09-20',
    activity: 'Transportasi biaya bensin',
    amount: 150000,
    status: 'Disetujui',
    statusClass: 'status-approved',
  },
  {
    date: '2025-11-15',
    activity: 'Pembayaran hotel selama inspeksi',
    amount: 1500000,
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
    const dateStr = item.date.toLowerCase()
    const formattedDateStr = formatDate(item.date).toLowerCase()
    return dateStr.includes(query) || formattedDateStr.includes(query)
  })
})

const submitReimbursement = () => {
  history.value.unshift({
    date: form.value.date,
    activity: form.value.activity,
    amount: form.value.amount,
    type: form.value.type,
    status: 'Menunggu',
    statusClass: 'status-pending',
  })

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
