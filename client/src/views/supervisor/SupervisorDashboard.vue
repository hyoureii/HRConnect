<template>
  <Layout>
    <section id="dashboard" class="content-section">
      <div class="profile-header">
        <div class="profile-pic">
          <i class="fa-solid fa-user"></i>
        </div>
        <div class="welcome-text">
          <h2>Hola, Haidar!</h2>
          <p>Enjoy your life and stay motivated!</p>
        </div>
      </div>

      <div class="widget full-width-widget">
        <div class="widget-header">
          <h3>Kinerja Tim 6 Bulan Terakhir</h3>
          <div class="search-box">
            <input type="month" v-model="searchDate" class="search-input" @change="handleSearch" />
            <button class="btn-search" @click="handleSearch">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        <div class="performance-legend">
          <span class="legend-item achieved-legend"
            ><i class="fa-solid fa-square"></i> Pencapaian</span
          >
          <span class="legend-item target-legend"><i class="fa-solid fa-square"></i> Target</span>
        </div>
        <div class="team-performance-chart">
          <div class="chart-bar-group" v-for="(data, index) in teamPerformanceData" :key="index">
            <div class="bar-container">
              <div class="chart-bar achieved-bar" :style="{ height: data.achieved + '%' }">
                <span class="bar-percentage">{{ data.achieved }}%</span>
              </div>
              <div class="chart-bar target-bar" :style="{ height: data.target + '%' }">
                <span class="bar-percentage">{{ data.target }}%</span>
              </div>
            </div>
            <span class="bar-label">{{ data.month }}</span>
          </div>
        </div>
        <div class="performance-details-summary">
          <div class="summary-column">
            <h4>Metrik Kinerja Utama (KPI)</h4>
            <ul>
              <li>
                <span><i class="fa-solid fa-circle"></i> Penyelesaian Tugas Tepat Waktu</span>
                <strong>85%</strong>
              </li>
              <li>
                <span><i class="fa-solid fa-circle"></i> Kualitas Hasil Kerja</span>
                <strong>92%</strong>
              </li>
              <li>
                <span><i class="fa-solid fa-circle"></i> Kolaborasi Tim</span>
                <strong>88%</strong>
              </li>
            </ul>
          </div>
          <div class="summary-column">
            <h4>Area yang Perlu Ditingkatkan</h4>
            <ul>
              <li>
                <span><i class="fa-solid fa-circle"></i> Kecepatan Respons Inisial</span>
              </li>
              <li>
                <span><i class="fa-solid fa-circle"></i> Inovasi dalam Proyek</span>
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
const teamPerformanceData = ref([
  { month: 'Mei', achieved: 75, target: 80 },
  { month: 'Jun', achieved: 60, target: 70 },
  { month: 'Jul', achieved: 85, target: 85 },
  { month: 'Ags', achieved: 90, target: 90 },
  { month: 'Sep', achieved: 70, target: 80 },
  { month: 'Okt', achieved: 95, target: 90 },
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

  teamPerformanceData.value.forEach((item, index) => {
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
  width: 150px;
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

.team-performance-chart {
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

.achieved-bar {
  background: linear-gradient(to top, var(--success-green), #58d68d);
}

.target-bar {
  background-color: var(--border-color);
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

.performance-legend {
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
.achieved-legend i {
  color: var(--success-green);
}
.target-legend i {
  color: var(--border-color);
}

.performance-details-summary {
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
.summary-column li i {
  font-size: 8px;
  color: var(--primary-blue);
}
</style>
