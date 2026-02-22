<template>
  <div class="flex flex-col gap-6">

    <!-- Header -->
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-3xl text-pink-900">
          Good {{ greeting }}, {{ firstName }} 🌸
        </h1>
        <p class="text-sm text-pink-900/40 mt-1">Here's your day at a glance</p>
      </div>
      <div class="text-right">
        <p class="font-display italic text-xl text-pink-500">{{ dateDay }}</p>
        <p class="text-xs text-pink-900/40 mt-0.5">{{ dateRest }}</p>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
          v-for="stat in stats" :key="stat.label"
          class="bg-white rounded-2xl border border-pink-100 shadow-card p-5 flex flex-col gap-2 relative overflow-hidden"
      >
        <div class="absolute top-0 left-0 right-0 h-[3px]" :style="`background: ${stat.color}`" />
        <span class="text-2xl">{{ stat.emoji }}</span>
        <div>
          <p class="font-display text-3xl font-semibold text-pink-900">{{ stat.value }}</p>
          <p class="text-xs text-pink-900/40 font-medium mt-0.5">{{ stat.label }}</p>
        </div>
        <div class="h-1 bg-pink-100 rounded-full overflow-hidden mt-1">
          <div class="h-full rounded-full transition-all duration-700" :style="`width:${stat.pct}%; background:${stat.color}`" />
        </div>
      </div>
    </div>

    <!-- Two-column section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

      <!-- Today's tasks -->
      <section class="bg-white rounded-2xl border border-pink-100 shadow-card p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display text-lg text-pink-900">Today's Tasks</h2>
          <RouterLink to="/tasks" class="text-xs font-semibold text-pink-500 hover:underline no-underline">
            See all →
          </RouterLink>
        </div>

        <!-- Skeleton -->
        <div v-if="tasksStore.loading" class="flex flex-col gap-2">
          <div v-for="i in 3" :key="i" class="skeleton h-14 rounded-xl" />
        </div>

        <!-- Empty -->
        <div v-else-if="tasksStore.todayTasks.length === 0"
             class="flex flex-col items-center justify-center py-10 text-center gap-2">
          <span class="text-4xl">🎉</span>
          <p class="font-display text-base text-pink-900">Nothing due today!</p>
          <p class="text-xs text-pink-900/40">You're all caught up</p>
        </div>

        <!-- List -->
        <TransitionGroup v-else tag="div" name="fade" class="flex flex-col gap-2">
          <div
              v-for="task in tasksStore.todayTasks" :key="task.id"
              :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors',
              task.status === 'completed' ? 'opacity-60' : ''
            ]"
          >
            <button
                @click="toggleComplete(task)"
                class="text-pink-400 text-lg bg-transparent border-none cursor-pointer p-0 shrink-0"
            >
              <i :class="task.status === 'completed' ? 'pi pi-check-circle' : 'pi pi-circle'" />
            </button>
            <div class="flex-1 min-w-0">
              <p :class="['text-sm font-medium text-pink-900 truncate', task.status === 'completed' ? 'line-through text-pink-900/40' : '']">
                {{ task.title }}
              </p>
              <p v-if="task.due_date" class="text-[11px] text-pink-900/40 mt-0.5">{{ formatTime(task.due_date) }}</p>
            </div>
            <PriorityBadge :priority="task.priority" />
          </div>
        </TransitionGroup>
      </section>

      <!-- Upcoming reminders -->
      <section class="bg-white rounded-2xl border border-pink-100 shadow-card p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display text-lg text-pink-900">Upcoming Reminders</h2>
          <RouterLink to="/reminders" class="text-xs font-semibold text-pink-500 hover:underline no-underline">
            See all →
          </RouterLink>
        </div>

        <div v-if="upcomingReminders.length === 0"
             class="flex flex-col items-center justify-center py-10 text-center gap-2">
          <span class="text-4xl">🔔</span>
          <p class="font-display text-base text-pink-900">No upcoming reminders</p>
          <p class="text-xs text-pink-900/40">Add reminders to your tasks</p>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div
              v-for="item in upcomingReminders" :key="item.reminder.id"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pink-50"
          >
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-300 to-pink-400
                        flex items-center justify-center text-white text-sm shrink-0">
              <i :class="channelIcon(item.reminder.channel)" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-pink-900 truncate">{{ item.taskTitle }}</p>
              <p class="text-[11px] text-pink-900/40 mt-0.5">{{ formatReminderTime(item.reminder.trigger_at) }}</p>
            </div>
            <span :class="[
              'text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0',
              item.urgent ? 'bg-pink-100 text-pink-600' : 'bg-lavender text-purple-700'
            ]">{{ item.label }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Priority breakdown -->
    <section class="bg-white rounded-2xl border border-pink-100 shadow-card p-6">
      <h2 class="font-display text-lg text-pink-900 mb-5">Priority Breakdown</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div v-for="p in priorities" :key="p.key">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-base">{{ p.emoji }}</span>
            <span class="text-sm font-semibold" :style="`color:${p.color}`">{{ p.label }}</span>
            <span class="ml-auto text-[11px] font-bold bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">
              {{ p.count }}
            </span>
          </div>
          <div class="flex flex-col gap-1.5">
            <div
                v-for="task in p.tasks.slice(0,3)" :key="task.id"
                class="text-xs text-pink-900/60 bg-pink-50 px-3 py-2 rounded-lg truncate"
            >{{ task.title }}</div>
            <p v-if="p.tasks.length === 0" class="text-xs italic text-pink-900/30">None ✓</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { useRemindersStore } from '@/stores/reminders'
import PriorityBadge from '@/components/PriorityBadge.vue'

const authStore     = useAuthStore()
const tasksStore    = useTasksStore()
const remindersStore = useRemindersStore()

const now  = new Date()
const hour = now.getHours()
const greeting  = computed(() => hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening')
const firstName = computed(() => authStore.user?.username?.split('_')[0] || 'friend')
const dateDay   = computed(() => now.toLocaleDateString('en-US', { weekday: 'long' }))
const dateRest  = computed(() => now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))

const total = computed(() => Math.max(tasksStore.tasks.length, 1))
const stats = computed(() => [
  { label: 'Total Tasks',  value: tasksStore.tasks.length,       emoji: '📋', color: '#f7608e', pct: 100 },
  { label: 'Pending',      value: tasksStore.pending.length,     emoji: '⏳', color: '#a855f7', pct: Math.round(tasksStore.pending.length / total.value * 100) },
  { label: 'In Progress',  value: tasksStore.inProgress.length,  emoji: '🔄', color: '#f97316', pct: Math.round(tasksStore.inProgress.length / total.value * 100) },
  { label: 'Completed',    value: tasksStore.completed.length,   emoji: '✅', color: '#22c55e', pct: Math.round(tasksStore.completed.length / total.value * 100) },
])

const upcomingReminders = computed(() => {
  const now = new Date()
  return Object.entries(remindersStore.remindersByTask).flatMap(([taskId, rems]) =>
      rems.filter(r => !r.is_sent && new Date(r.trigger_at) > now).map(r => {
        const diff = new Date(r.trigger_at) - now
        const mins = Math.floor(diff / 60000)
        const urgent = diff < 3600000
        const label = mins < 60 ? `${mins}m` : mins < 1440 ? `${Math.floor(mins/60)}h` : `${Math.floor(mins/1440)}d`
        return {
          reminder: r,
          taskTitle: tasksStore.tasks.find(t => t.id === Number(taskId))?.title || `Task #${taskId}`,
          urgent, label
        }
      })
  ).sort((a,b) => new Date(a.reminder.trigger_at) - new Date(b.reminder.trigger_at)).slice(0,5)
})

const priorities = computed(() => {
  const active = tasksStore.tasks.filter(t => t.status !== 'completed')
  return [
    { key: 'high',   label: 'High',   emoji: '🔴', color: '#c9306a', count: active.filter(t=>t.priority==='high').length,   tasks: active.filter(t=>t.priority==='high') },
    { key: 'medium', label: 'Medium', emoji: '🟡', color: '#92660a', count: active.filter(t=>t.priority==='medium').length, tasks: active.filter(t=>t.priority==='medium') },
    { key: 'low',    label: 'Low',    emoji: '🟢', color: '#1a7a5e', count: active.filter(t=>t.priority==='low').length,    tasks: active.filter(t=>t.priority==='low') },
  ]
})

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
function formatReminderTime(dt) {
  return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function channelIcon(ch) {
  return ch === 'email' ? 'pi pi-envelope' : ch === 'sms' ? 'pi pi-mobile' : 'pi pi-bell'
}
async function toggleComplete(task) {
  if (task.status !== 'completed') await tasksStore.completeTask(task.id)
}

onMounted(async () => {
  await tasksStore.fetchTasks()
  for (const task of tasksStore.tasks.slice(0, 20)) {
    await remindersStore.fetchReminders(task.id)
  }
})
</script>