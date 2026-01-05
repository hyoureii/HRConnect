<script lang="ts" setup>
  import { provide } from 'vue'
  import './main.css'
import { businessTripTypes, leaveTypes } from './utils/types'

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  provide('leaveTypes', leaveTypes)
  provide('businessTripTypes', businessTripTypes)
  provide('formatCurrency', formatCurrency)
  provide('formatDate', formatDate)
</script>

<template>
  <div class="app-viewport">
    <router-view />
  </div>
</template>

<style scoped></style>
