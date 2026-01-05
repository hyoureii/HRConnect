<template>
  <Layout>
    <section id="dashboard" class="content-section">
      <div class="profile-header">
        <div class="profile-pic">
          <i class="fa-solid fa-user"></i>
        </div>
        <div class="welcome-text">
          <h2>Hola, Fizryan!</h2>
          <p>Enjoy your life and stay motivated!</p>
        </div>
      </div>

      <div class="widget full-width-widget">
        <div class="widget-header">
          <h3>Kinerja Sub-Divisi</h3>
          <div class="search-box">
            <input type="month" v-model="searchDate" class="search-input" />
            <button class="btn-search" @click="handleSearch">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        <div class="division-performance-chart">
          <div class="chart-bar-group">
            <div class="bar-container">
              <div class="chart-bar" style="height: 85%">
                <span class="bar-percentage">85%</span>
              </div>
            </div>
            <span class="bar-label">Tim Absensi</span>
          </div>
          <div class="chart-bar-group">
            <div class="bar-container">
              <div class="chart-bar" style="height: 78%">
                <span class="bar-percentage">78%</span>
              </div>
            </div>
            <span class="bar-label">Tim Evaluasi Kinerja</span>
          </div>
          <div class="chart-bar-group">
            <div class="bar-container">
              <div class="chart-bar" style="height: 92%">
                <span class="bar-percentage">92%</span>
              </div>
            </div>
            <span class="bar-label">Tim Rekrutmen</span>
          </div>
          <div class="chart-bar-group">
            <div class="bar-container">
              <div class="chart-bar" style="height: 70%">
                <span class="bar-percentage">70%</span>
              </div>
            </div>
            <span class="bar-label">Tim Administrasi</span>
          </div>
          <div class="chart-bar-group">
            <div class="bar-container">
              <div class="chart-bar" style="height: 88%">
                <span class="bar-percentage">88%</span>
              </div>
            </div>
            <span class="bar-label">Tim Monitoring Dispilin</span>
          </div>
        </div>
        <div class="performance-details-summary">
          <div class="summary-item">
            <h4><i class="fa-solid fa-circle"></i> Tim Evaluasi (Supervisor: Rizky)</h4>
            <p>
              Laporan KPI selesai lebih cepat dari target dan hasil penilaian lebih akurat. Kinerja
              sangat baik, perlu diterapkan sistem review lintas tim.
            </p>
          </div>
          <div class="summary-item">
            <h4><i class="fa-solid fa-circle"></i> Tim Rekrutmen (Supervisor: Haidar)</h4>
            <p>
              Rekrutmen berjalan lancar namun terdapat keterlambatan dalam laporan pelatihan. Perlu
              peningkatan koordinasi dengan bagian Training Center.
            </p>
          </div>
          <div class="summary-item">
            <h4><i class="fa-solid fa-circle"></i> Tim Administrasi (Supervisor: Haykal)</h4>
            <p>
              Berhasil menjaga akurasi data kepegawaian 98%. Sistem digitalisasi dokumen berjalan
              baik. Disarankan audit data tahunan untuk peningkatan kualitas.
            </p>
          </div>
        </div>
      </div>

      <div class="widget-grid">
        <div class="widget text-widget">
          <i class="widget-icon fa-solid fa-calendar-check"></i>
          <h3>Sisa Cuti Tahunan</h3>
          <p class="big-text">9 <span class="small-text">Hari</span></p>
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
import { ref } from 'vue'
import Layout from '@/Layout.vue'

const searchDate = ref('')

const handleSearch = () => {
  console.log('Melakukan pencarian untuk:', searchDate.value)
}
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

.division-performance-chart {
  height: 250px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  gap: 30px;
  padding: 20px 10px 40px 10px;
  border-bottom: 1px solid var(--border-color);
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100%;
  min-width: 80px;
}

.bar-container {
  display: flex;
  align-items: flex-end;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.chart-bar {
  width: 55px;
  background: linear-gradient(to top, var(--primary-blue), #65a5ff);
  border-radius: 8px 8px 0 0;
  animation: grow 1s ease-out forwards;
  transform-origin: bottom;
  position: relative;
}

.bar-percentage {
  position: absolute;
  top: -22px;
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
  text-align: center;
}

@keyframes grow {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

.performance-details-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 30px;
  padding-top: 25px;
}

.summary-item h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--dark-text);
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-item h4 i {
  font-size: 8px;
  color: var(--primary-blue);
}

.summary-item p {
  color: var(--grey-text);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}
</style>
