<script setup lang="ts">
  import '../main.css'
  const emit = defineEmits<{ resolve: [value: boolean] }>()
</script>

<template>
  <div id="success-modal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-icon">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h2>Berhasil!</h2>
      <p>Pengajuan cuti Anda telah berhasil dikirim.</p>
      <button id="modal-close-btn" class="submit-button" @click="emit('resolve', true)">OK</button>
    </div>
  </div>
</template>
