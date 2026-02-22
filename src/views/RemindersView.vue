<template>
  <div class="flex flex-col gap-6">

    <div>
      <h1 class="font-display text-3xl text-pink-900">Reminders 🔔</h1>
      <p class="text-sm text-pink-900/40 mt-1">Upcoming alerts across all your tasks</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="i in 5" :key="i" class="skeleton h-20 rounded-2xl" />
    </div>

    <!-- Empty -->
    <div v-else-if="allReminders.length === 0"
         class="bg-white rounded-2xl border border-pink-100 shadow-card flex flex-col items-center justify-center py-24 gap-3">
      <span class="text-5xl">🔔</span>
      <h3 class="font-display text-xl text-pink-900">No reminders yet</h3>
      <p class="text-sm text-pink-900/40">Go to a task and add a reminder to see it here</p>
      <RouterLink
          to="/tasks"
          class="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white no-underline
               bg-gradient-to-r from-pink-400 to-pink-500 shadow-pink hover:opacity-90 transition-all"
      >
        <i class="pi pi-arrow-right" /> View Tasks
      </RouterLink>
    </div>

    <!-- Sections -->
    <div v-else class="flex flex-col gap-8">
      <div v-for="section in sections" :key="section.label">
        <div v-if="section.items.length">
          <p class="text-xs font-bold uppercase tracking-widest text-pink-900/40 mb-3">{{ section.label }}</p>

          <div class="flex flex-col gap-3">
            <TransitionGroup tag="div" name="fade" class="flex flex-col gap-3">
              <div
                  v-for="item in section.items" :key="item.reminder.id"
                  class="bg-white rounded-2xl border border-pink-100 shadow-card px-5 py-4
                       flex items-center gap-4 flex-wrap"
              >
                <!-- Channel icon -->
                <div :class="['w-11 h-11 rounded-xl flex items-center justify-center text-white text-base shrink-0', channelBg(item.reminder.channel)]">
                  <i :class="channelIcon(item.reminder.channel)" />
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-pink-900 truncate">{{ item.taskTitle }}</p>
                  <p class="text-xs text-pink-900/40 mt-0.5">{{ formatFull(item.reminder.trigger_at) }}</p>
                  <span class="inline-flex mt-1 text-[10px] font-bold uppercase tracking-wide
                               px-2 py-0.5 rounded-full bg-pink-100 text-pink-500">
                    {{ item.reminder.channel || 'push' }}
                  </span>
                </div>

                <!-- Countdown + actions -->
                <div class="flex items-center gap-2 shrink-0">
                  <span :class="[
                    'text-xs font-bold px-3 py-1 rounded-full',
                    item.overdue ? 'bg-red-100 text-red-600'
                    : item.urgent ? 'bg-pink-100 text-pink-600'
                    : 'bg-purple-100 text-purple-700'
                  ]">{{ item.label }}</span>

                  <button
                      v-if="!item.overdue && !item.reminder.is_sent"
                      @click="handleSnooze(item)"
                      title="Snooze 10 min"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-pink-200 text-pink-400
                           text-xs font-medium bg-white hover:bg-pink-50 hover:border-pink-300 transition-all cursor-pointer"
                  >
                    <i class="pi pi-clock text-xs" /> Snooze
                  </button>

                  <button
                      @click="handleDelete(item)"
                      title="Delete"
                      class="w-8 h-8 rounded-lg border border-pink-200 text-pink-300 bg-white
                           flex items-center justify-center hover:bg-pink-100 hover:border-pink-300 hover:text-pink-600
                           transition-all cursor-pointer"
                  >
                    <i class="pi pi-trash text-xs" />
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'
import { useRemindersStore } from '@/stores/reminders'
import { useToast } from 'primevue/usetoast'

const tasksStore    = useTasksStore()
const remStore      = useRemindersStore()
const toast         = useToast()
const loading       = ref(false)

const allReminders = computed(() => {
  const now = new Date()
  return Object.entries(remStore.remindersByTask).flatMap(([taskId, rems]) =>
      rems.map(r => {
        const diff    = new Date(r.trigger_at) - now
        const overdue = diff < 0
        const urgent  = !overdue && diff < 3600000
        const mins    = Math.floor(diff / 60000)
        const label   = overdue ? 'Overdue'
            : mins < 60 ? `in ${mins}m`
                : mins < 1440 ? `in ${Math.floor(mins/60)}h`
                    : `in ${Math.floor(mins/1440)}d`
        return {
          reminder: r,
          taskTitle: tasksStore.tasks.find(t => t.id === Number(taskId))?.title || `Task #${taskId}`,
          overdue, urgent, label
        }
      })
  ).sort((a, b) => new Date(a.reminder.trigger_at) - new Date(b.reminder.trigger_at))
})

const sections = computed(() => {
  const now      = new Date()
  const todayEnd = new Date(now); todayEnd.setHours(23,59,59)
  const tmrEnd   = new Date(todayEnd); tmrEnd.setDate(tmrEnd.getDate() + 1)
  return [
    { label: '📅 Today',    items: allReminders.value.filter(i => { const d = new Date(i.reminder.trigger_at); return d >= now && d <= todayEnd }) },
    { label: '🌅 Tomorrow', items: allReminders.value.filter(i => { const d = new Date(i.reminder.trigger_at); return d > todayEnd && d <= tmrEnd }) },
    { label: '📆 Upcoming', items: allReminders.value.filter(i => new Date(i.reminder.trigger_at) > tmrEnd) },
    { label: '⚠️ Overdue',  items: allReminders.value.filter(i => i.overdue) },
  ]
})

function channelIcon(ch) { return ch === 'email' ? 'pi pi-envelope' : ch === 'sms' ? 'pi pi-mobile' : 'pi pi-bell' }
function channelBg(ch) {
  return ch === 'email' ? 'bg-gradient-to-br from-indigo-400 to-indigo-500'
      : ch === 'sms'   ? 'bg-gradient-to-br from-emerald-400 to-emerald-500'
          : 'bg-gradient-to-br from-pink-300 to-pink-400'
}
function formatFull(dt) {
  return new Date(dt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function handleSnooze(item) {
  await remStore.snoozeReminder(item.reminder.task_id, item.reminder.id, 10)
  toast.add({ severity: 'info', summary: '⏰ Snoozed!', detail: 'Reminder snoozed 10 minutes', life: 2000 })
}
async function handleDelete(item) {
  await remStore.deleteReminder(item.reminder.task_id, item.reminder.id)
  toast.add({ severity: 'info', summary: 'Deleted', detail: 'Reminder removed', life: 2000 })
}

onMounted(async () => {
  loading.value = true
  await tasksStore.fetchTasks()
  for (const t of tasksStore.tasks.slice(0, 50)) {
    await remStore.fetchReminders(t.id)
  }
  loading.value = false
})
</script>