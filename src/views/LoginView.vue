<template>
  <div class="min-h-screen flex">

    <!-- ── Left art panel ─────────────────────── -->
    <div class="hidden md:flex flex-1 bg-gradient-to-br from-pink-200 via-pink-300 to-pink-500
                items-center justify-center p-12 relative overflow-hidden">
      <!-- decorative circle -->
      <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10" />
      <div class="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10" />

      <div class="relative z-10 text-center">
        <p class="font-display italic text-white text-xl mb-10 opacity-90">
          Your cozy little productivity space 🌸
        </p>

        <!-- Floating sample cards -->
        <div class="flex flex-col gap-3 items-start">
          <div class="animate-float-1 bg-white/80 backdrop-blur-md border border-white/60
                      rounded-2xl px-4 py-3 text-sm font-medium text-pink-900 shadow-pink -rotate-1">
            ✅ Submit report by Friday
          </div>
          <div class="animate-float-2 bg-white/80 backdrop-blur-md border border-white/60
                      rounded-2xl px-4 py-3 text-sm font-medium text-pink-900 shadow-pink rotate-1 ml-8">
            🔔 Team standup in 30 min
          </div>
          <div class="animate-float-3 bg-white/80 backdrop-blur-md border border-white/60
                      rounded-2xl px-4 py-3 text-sm font-medium text-pink-900 shadow-pink -rotate-1 ml-4">
            📝 Buy groceries
          </div>
          <div class="animate-float-4 bg-white/80 backdrop-blur-md border border-white/60
                      rounded-2xl px-4 py-3 text-sm font-medium text-pink-900 shadow-pink rotate-2 ml-10">
            🌸 Self-care Sunday
          </div>
        </div>
      </div>
    </div>

    <!-- ── Right form panel ───────────────────── -->
    <div class="w-full md:w-[420px] flex items-center justify-center p-8 bg-pink-50">
      <div class="w-full bg-white rounded-2xl border border-pink-100 shadow-card p-10">

        <!-- Header -->
        <div class="text-center mb-8">
          <span class="text-5xl">🌸</span>
          <h1 class="font-display text-3xl text-pink-900 mt-3 mb-1">Welcome back</h1>
          <p class="text-sm text-pink-900/40">Sign in to Pinky's</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Email</label>
            <input
                v-model="form.email" type="email" required
                placeholder="you@example.com"
                class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white
                     text-sm text-pink-900 placeholder-pink-200
                     outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100
                     transition-all duration-200"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Password</label>
            <input
                v-model="form.password" type="password" required
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white
                     text-sm text-pink-900 placeholder-pink-200
                     outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100
                     transition-all duration-200"
            />
          </div>

          <p v-if="error" class="bg-pink-100 text-pink-600 text-sm font-medium px-4 py-3 rounded-xl">
            {{ error }}
          </p>

          <button
              type="submit" :disabled="authStore.loading"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500
                   text-white font-semibold text-sm shadow-pink
                   hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200
                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i v-if="authStore.loading" class="pi pi-spinner pi-spin" />
            {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="text-center text-xs text-pink-900/40 mt-6">
          Don't have an account?
          <RouterLink to="/register" class="text-pink-500 font-semibold hover:underline ml-1">Create one</RouterLink>
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
const form      = ref({ email: '', password: '' })

async function handleLogin() {
  error.value = ''
  const result = await authStore.login(form.value.email, form.value.password)
  if (result.success) router.replace('/')
  else error.value = result.message
}
</script>