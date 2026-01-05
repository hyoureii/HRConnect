<template>
  <Layout>
    <section id="payroll" class="content-section">
      <form class="card-form" @submit.prevent="submitReimbursement">
        <h2>Formulir Pengajuan Reimburse</h2>
        <div class="form-group">
          <label for="reimburse-type">Jenis Reimburse</label>
          <select id="reimburse-type" v-model="form.type" required>
            <option value="" disabled selected>Pilih Jenis Reimburse</option>
            <option v-for="type in reimbursementTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="reimburse-kegiatan">Keterangan Kegiatan</label>
          <textarea id="reimburse-kegiatan" rows="5" v-model="form.activity" required></textarea>
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
          <tbody v-if="!isLoading">
            <tr v-for="(item, index) in filteredHistory" :key="index">
              <td>{{ formatDate(item.date) }}</td>
              <td>{{ item.description }}</td>
              <td>{{ formatCurrency(item.amount) }}</td>
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
import { reimbursementTypes } from '@/utils/types'

const formatDate = inject('formatDate')
const formatCurrency = inject('formatCurrency')
const openSuccessModal = inject('openSuccessModal')
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref('')

const form = ref({
  activity: '',
  date: '',
  amount: '',
  type: '',
})

const history = ref([])

onMounted(async () => {
  isLoading.value = true
  error.value = ''
  try {
    const result = await client.api.reimbursements.get()
    if (result.data) {
      history.value = result.data
    }
  } catch (err) {
    console.error('Error fetching reimbursements:', err)
    error.value = 'Failed to load reimbursements'
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
      history.value = result.data
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
