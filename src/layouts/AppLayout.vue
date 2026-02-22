<template>
  <div class="flex min-h-screen bg-pink-50 relative">

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
          v-if="sidebarOpen && isMobile"
          class="fixed inset-0 bg-pink-900/30 backdrop-blur-sm z-[99]"
          @click="sidebarOpen = false"
      />
    </Transition>

    <!-- ── Sidebar ─────────────────────────────────── -->
    <Transition name="slide">
      <aside
          v-show="!isMobile || sidebarOpen"
          class="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-pink-100
               flex flex-col z-[100]"
          style="box-shadow: 4px 0 20px rgba(232,68,122,0.06)"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-7 border-b border-pink-100">
          <span class="text-3xl">🌸</span>
          <span class="font-display italic text-2xl text-pink-500">Pinky's</span>
        </div>

        <!-- Nav links -->
        <nav class="flex-1 flex flex-col gap-1 px-4 pt-5">
          <RouterLink
              v-for="item in navItems"
              :key="item.name"
              :to="item.to"
              :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative no-underline',
              route.name === item.name
                ? 'bg-gradient-to-r from-pink-50 to-rose-100 text-pink-500 font-semibold'
                : 'text-pink-900/60 hover:bg-pink-50 hover:text-pink-500'
            ]"
              @click="isMobile && (sidebarOpen = false)"
          >
            <span
                v-if="route.name === item.name"
                class="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-pink-400 rounded-r-full"
            />
            <i :class="[item.icon, 'text-base w-5 text-center shrink-0']" />
            <span>{{ item.label }}</span>
            <span
                v-if="item.badge"
                class="ml-auto bg-pink-400 text-white text-[10px] font-bold
                     min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
            >{{ item.badge }}</span>
          </RouterLink>
        </nav>

        <!-- User footer -->
        <div class="border-t border-pink-100 px-4 py-4 flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-pink-500
                      flex items-center justify-center text-white font-bold text-sm shrink-0">
            {{ userInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-pink-900 truncate">{{ authStore.user?.username }}</p>
            <p class="text-[11px] text-pink-900/40 truncate">{{ authStore.user?.email }}</p>
          </div>
          <button
              @click="handleLogout"
              title="Logout"
              class="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 text-pink-300
                   flex items-center justify-center hover:bg-pink-100 hover:text-pink-500
                   cursor-pointer transition-all duration-200"
          >
            <i class="pi pi-sign-out text-sm" />
          </button>
        </div>
      </aside>
    </Transition>

    <!-- ── Main area ───────────────────────────────── -->
    <div class="flex-1 flex flex-col md:ml-64">

      <!-- Mobile topbar -->
      <header
          v-if="isMobile"
          class="sticky top-0 z-[90] flex items-center justify-between
               px-5 py-4 bg-white border-b border-pink-100"
          style="box-shadow: 0 2px 12px rgba(232,68,122,0.06)"
      >
        <button
            @click="sidebarOpen = !sidebarOpen"
            class="text-pink-400 text-lg p-1 bg-transparent border-none cursor-pointer"
        >
          <i class="pi pi-bars" />
        </button>
        <span class="font-display italic text-lg text-pink-500">🌸 Pinky's</span>
        <div class="w-8" />
      </header>

      <!-- Page content -->
      <main class="flex-1 p-8 max-md:px-4 max-md:pt-5 max-md:pb-28 max-w-6xl w-full">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <!-- ── Bottom nav (mobile only) ───────────────── -->
    <nav
        v-if="isMobile"
        class="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-pink-100 flex"
        style="box-shadow: 0 -4px 20px rgba(232,68,122,0.08); padding-bottom: env(safe-area-inset-bottom)"
    >
      <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          :class="[
          'flex-1 flex flex-col items-center justify-center gap-1 py-3 no-underline',
          'text-[10px] font-medium transition-colors duration-200',
          route.name === item.name ? 'text-pink-500' : 'text-pink-900/40'
        ]"
      >
        <i :class="[item.icon, 'text-[18px]']" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'

const route      = useRoute()
const router     = useRouter()
const authStore  = useAuthStore()
const tasksStore = useTasksStore()

const sidebarOpen = ref(false)
const isMobile    = ref(window.innerWidth < 768)

const navItems = computed(() => [
  { name: 'Dashboard', to: '/',          icon: 'pi pi-home',         label: 'Dashboard' },
  { name: 'Tasks',     to: '/tasks',     icon: 'pi pi-check-square', label: 'Tasks',
    badge: tasksStore.pending.length || null },
  { name: 'Reminders', to: '/reminders', icon: 'pi pi-bell',         label: 'Reminders' },
  { name: 'Notes',     to: '/notes',     icon: 'pi pi-file-edit',    label: 'Notes' },
])

const userInitial = computed(() => authStore.user?.username?.[0]?.toUpperCase() || '?')

function handleLogout() { authStore.logout(); router.push('/login') }
function onResize()     { isMobile.value = window.innerWidth < 768 }

onMounted(() => { window.addEventListener('resize', onResize); tasksStore.fetchTasks() })
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>