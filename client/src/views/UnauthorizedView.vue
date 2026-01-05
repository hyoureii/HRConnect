<template>
  <div class="unauthorized-page">
    <div class="unauthorized-container">
      <div class="icon-container">
        <i class="fa-solid fa-ban"></i>
      </div>
      <h1>Akses Ditolak</h1>
      <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <button class="back-button" @click="goToDashboard">
        Kembali ke Login
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToDashboard = () => {
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.unauthorized-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: var(--light-grey-bg);
}

.unauthorized-container {
  background-color: #ffffff;
  padding: 60px 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 39, 117, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.icon-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f8d7da;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 25px auto;
}

.icon-container i {
  font-size: 50px;
  color: var(--danger-red);
}

h1 {
  color: var(--dark-text);
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
}

p {
  color: var(--grey-text);
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.5;
}

.back-button {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-blue);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #0052cc;
}
</style>
