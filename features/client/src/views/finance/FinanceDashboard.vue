<template>
  <Layout>
    <section id="dashboard" class="content-section">
      <div class="profile-header">
        <div class="profile-pic">
          <i class="fa-solid fa-user"></i>
        </div>
        <div class="welcome-text">
          <h2>Hola, Naufal!</h2>
          <p>Enjoy your life and stay motivated!</p>
        </div>
      </div>

      <div class="cashflow-header">
        <div class="cashflow-item income">
          <div class="cashflow-icon">
            <i class="fa-solid fa-arrow-down"></i>
          </div>
          <div class="cashflow-details">
            <h4>Total Pemasukan</h4>
            <p>Rp 1.250.000.000</p>
          </div>
        </div>
        <div class="cashflow-item expense">
          <div class="cashflow-icon">
            <i class="fa-solid fa-arrow-up"></i>
          </div>
          <div class="cashflow-details">
            <h4>Total Pengeluaran</h4>
            <p>Rp 875.500.000</p>
          </div>
        </div>
        <div class="cashflow-item balance">
          <div class="cashflow-icon">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
          <div class="cashflow-details">
            <h4>Saldo Akhir</h4>
            <p>Rp 374.500.000</p>
          </div>
        </div>
      </div>

      <div class="widget full-width-widget">
        <div class="widget-header">
          <h3>Cash Flow 6 Bulan Terakhir</h3>
          <div class="search-box">
            <input type="month" v-model="searchDate" class="search-input" @change="handleSearch" />
            <button class="btn-search" @click="handleSearch">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        <div class="cashflow-legend">
          <span class="legend-item income-legend"
            ><i class="fa-solid fa-square"></i> Pemasukan</span
          >
          <span class="legend-item expense-legend"
            ><i class="fa-solid fa-square"></i> Pengeluaran</span
          >
        </div>
        <div class="cashflow-chart">
          <div class="chart-bar-group" v-for="(data, index) in cashflowData" :key="index">
            <div class="bar-container">
              <div class="chart-bar income-bar" :style="{ height: data.income + '%' }">
                <span class="bar-percentage">{{ data.income }}%</span>
              </div>
              <div class="chart-bar expense-bar" :style="{ height: data.expense + '%' }">
                <span class="bar-percentage">{{ data.expense }}%</span>
              </div>
            </div>
            <span class="bar-label">{{ data.month }}</span>
          </div>
        </div>

        <div class="cashflow-details-summary">
          <div class="summary-column">
            <h4>Detail Pemasukan Utama</h4>
            <ul>
              <li>
                <span><i class="fa-solid fa-circle"></i> Penjualan Tandan Buah Segar</span>
                <strong>65%</strong>
              </li>
              <li>
                <span><i class="fa-solid fa-circle"></i> Subsidi Operasional</span>
                <strong>25%</strong>
              </li>
              <li>
                <span><i class="fa-solid fa-circle"></i> Penjualan Limbah Sawit</span>
                <strong>10%</strong>
              </li>
            </ul>
          </div>
          <div class="summary-column">
            <h4>Detail Pengeluaran Utama</h4>
            <ul>
              <li>
                <span><i class="fa-solid fa-circle"></i> Gaji & Tunjangan Karyawan</span>
                <strong>50%</strong>
              </li>
              <li>
                <span><i class="fa-solid fa-circle"></i> Pembelian Pupuk & Pestisida</span>
                <strong>35%</strong>
              </li>
              <li>
                <span><i class="fa-solid fa-circle"></i> Biaya Operasional Kantor</span>
                <strong>15%</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="widget-grid">
        <div class="widget text-widget">
          <i class="widget-icon fa-solid fa-calendar-check"></i>
          <h3>Sisa Cuti Tahunan</h3>
          <p class="big-text">10 <span class="small-text">Hari</span></p>
        </div>
        <div class="widget">
          <i class="widget-icon fa-solid fa-plane-departure"></i>
          <h3>Jadwal Perjalanan Bisnis</h3>
          <div class="empty-state">
            <i class="fa-solid fa-calendar-xmark empty-icon"></i>
            <p>Belum ada jadwal perjalanan bisnis saat ini.</p>
          </div>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Layout from '@/Layout.vue'

const searchDate = ref('')
const cashflowData = ref([
  { month: 'Mei', income: 80, expense: 60 },
  { month: 'Jun', income: 70, expense: 55 },
  { month: 'Jul', income: 90, expense: 75 },
  { month: 'Ags', income: 85, expense: 65 },
  { month: 'Sep', income: 95, expense: 80 },
  { month: 'Okt', income: 70, expense: 50 },
])

const updateChartPeriods = (endDateStr) => {
  if (!endDateStr) return

  const endDate = new Date(endDateStr)
  const newLabels = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1)
    const monthName = d.toLocaleString('id-ID', { month: 'short' })
    newLabels.push(monthName)
  }

  cashflowData.value.forEach((item, index) => {
    item.month = newLabels[index]
  })
}

const handleSearch = () => {
  console.log('Menampilkan data periode berakhir:', searchDate.value)
  updateChartPeriods(searchDate.value)
}

onMounted(() => {
  searchDate.value = '2024-10'
  updateChartPeriods(searchDate.value)
})
</script>

<style scoped>
.cashflow-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.cashflow-item {
  background-color: var(--white);
  padding: 25px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  box-shadow: var(--shadow);
}

.cashflow-icon {
  font-size: 24px;
  padding: 15px;
  border-radius: 50%;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.income .cashflow-icon {
  background-color: #d4efdf;
  color: var(--success-green);
}
.expense .cashflow-icon {
  background-color: #f8d7da;
  color: var(--danger-red);
}
.balance .cashflow-icon {
  background-color: #d6eaf8;
  color: var(--info-blue);
}

.cashflow-details h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: var(--grey-text);
  font-weight: 500;
}

.cashflow-details p {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--dark-text);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.widget-header h3 {
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
  cursor: pointer;
  width: 170px;
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

.cashflow-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 250px;
  padding: 20px 0 40px 0;
  gap: 15px;
  border-left: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100%;
  min-width: 50px;
}

.bar-container {
  display: flex;
  align-items: flex-end;
  height: 100%;
  gap: 5px;
  width: 100%;
  justify-content: center;
}

.chart-bar {
  width: 30px;
  border-radius: 8px 8px 0 0;
  position: relative;
  animation: grow 1s ease-out forwards;
  transform-origin: bottom;
}

.income-bar {
  background: linear-gradient(to top, var(--success-green), #58d68d);
}

.expense-bar {
  background: linear-gradient(to top, var(--danger-red), #f1948a);
}

.bar-percentage {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  color: var(--dark-text);
}

.bar-label {
  position: absolute;
  bottom: -30px;
  font-size: 14px;
  font-weight: 500;
  color: var(--grey-text);
}

@keyframes grow {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

.cashflow-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  justify-content: flex-end;
  font-size: 14px;
  color: var(--grey-text);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item i {
  font-size: 16px;
}
.income-legend i {
  color: var(--success-green);
}
.expense-legend i {
  color: var(--danger-red);
}

.cashflow-details-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid var(--border-color);
}

.summary-column h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--dark-text);
}

.summary-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
  color: var(--grey-text);
}

.summary-column li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.summary-column li span {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-column li strong {
  font-weight: 600;
  color: var(--dark-text);
}

.summary-column:first-of-type li i {
  color: var(--success-green);
}
.summary-column:last-of-type li i {
  color: var(--danger-red);
}
</style>
