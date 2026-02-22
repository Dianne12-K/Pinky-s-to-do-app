<template>
  <div id="app" class="min-h-screen bg-pink-50">
    <RouterView />
    <Toast />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Toast from 'primevue/toast'

const authStore = useAuthStore()

onMounted(async () => {
  // Silently restore user profile if token exists
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }
})
</script>