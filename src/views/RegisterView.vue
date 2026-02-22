<template>
  <div class="min-h-screen flex">

    <!-- Left art panel -->
    <div class="hidden md:flex flex-1 bg-gradient-to-br from-pink-100 via-pink-300 to-pink-600
                items-center justify-center p-12 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10" />
      <div class="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/10" />

      <div class="relative z-10 text-center">
        <p class="font-display italic text-white text-xl mb-10 opacity-90">
          Start your productivity journey 🌸
        </p>
        <div class="flex flex-wrap justify-center gap-3 max-w-[180px] mx-auto">
          <span
              v-for="i in 8" :key="i"
              class="text-4xl animate-petal"
              :style="`animation-delay: ${i * 0.2}s`"
          >🌸</span>
        </div>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="w-full md:w-[420px] flex items-center justify-center p-8 bg-pink-50">
      <div class="w-full bg-white rounded-2xl border border-pink-100 shadow-card p-10">

        <div class="text-center mb-8">
          <span class="text-5xl">🌸</span>
          <h1 class="font-display text-3xl text-pink-900 mt-3 mb-1">Join Pinky's</h1>
          <p class="text-sm text-pink-900/40">Create your cozy space</p>
        </div>

        <form @submit.prevent="handleRegister" class="flex flex-col gap-5">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Username</label>
            <input
                v-model="form.username" type="text" required placeholder="pinky_girl"
                class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white
                     text-sm text-pink-900 placeholder-pink-200
                     outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Email</label>
            <input
                v-model="form.email" type="email" required placeholder="you@example.com"
                class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white
                     text-sm text-pink-900 placeholder-pink-200
                     outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Password</label>
            <input
                v-model="form.password" type="password" required placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white
                     text-sm text-pink-900 placeholder-pink-200
                     outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
            />
          </div>

          <p v-if="error"   class="bg-pink-100 text-pink-600 text-sm font-medium px-4 py-3 rounded-xl">{{ error }}</p>
          <p v-if="success" class="bg-green-50 text-green-700 text-sm font-medium px-4 py-3 rounded-xl">{{ success }}</p>

          <button
              type="submit" :disabled="authStore.loading"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500
                   text-white font-semibold text-sm shadow-pink
                   hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200
                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i v-if="authStore.loading" class="pi pi-spinner pi-spin" />
            {{ authStore.loading ? 'Creating...' : 'Create account' }}
          </button>
        </form>

        <p class="text-center text-xs text-pink-900/40 mt-6">
          Already have an account?
          <RouterLink to="/login" class="text-pink-500 font-semibold hover:underline ml-1">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router    = useRouter()
const error     = ref('')
const success   = ref('')
const form      = ref({ username: '', email: '', password: '' })

async function handleRegister() {
  error.value = ''; success.value = ''
  const result = await authStore.register(form.value.username, form.value.email, form.value.password)
  if (result.success) {
    success.value = '🎉 Account created! Redirecting...'
    setTimeout(() => router.push('/login'), 1500)
  } else {
    error.value = result.message
  }
}
</script>