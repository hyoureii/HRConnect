<template>
  <Teleport to="body">
    <component v-if="active" :is="component" v-bind="props" @resolve="resolve" @reject="reject" />
  </Teleport>
</template>

<script lang="ts">
import { shallowRef } from 'vue'
import type { Component } from 'vue'

let resolve: (value: never) => void
let reject: (reason?: never) => void

const active = shallowRef(false)
const component = shallowRef<Component | null>(null)
const props = shallowRef<Record<string, unknown>>({})

export async function open<T = never>(
  comp: Component,
  userProps: Record<string, unknown> = {}
): Promise<T> {
  component.value = comp
  props.value = userProps
  active.value = true

  try {
    return await new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })
  } finally {
    active.value = false
    component.value = null
    props.value = {}
  }
}
</script>

<script setup lang="ts">
// Template-specific logic can be added here
// Variables from the script above (active, component, props, resolve, reject) are automatically available
</script>

<style>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
