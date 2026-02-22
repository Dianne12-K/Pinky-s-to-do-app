<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <RouterView v-if="ready" />
    <div v-else class="min-h-screen flex items-center justify-center bg-pink-50">
      <div class="flex flex-col items-center gap-3">
        <span class="text-5xl animate-pulse">🌸</span>
        <p class="text-pink-400 font-medium text-sm">Loading...</p>
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Toast from 'primevue/toast'

const authStore = useAuthStore()
const ready     = ref(false)

onMounted(async () => {
  // If a token exists in localStorage, restore the user before rendering any route
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }
  ready.value = true
})
</script>