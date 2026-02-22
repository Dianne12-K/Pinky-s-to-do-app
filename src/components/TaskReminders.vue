<template>
  <div class="flex flex-col gap-4">

    <!-- Add reminder form -->
    <div class="bg-pink-50 border border-pink-100 rounded-xl p-4 flex flex-col gap-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-pink-400">Add Reminder</p>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Date & Time</label>
          <input
              v-model="newRem.trigger_at" type="datetime-local"
              class="w-full px-3 py-2.5 rounded-xl border border-pink-200 bg-white text-xs text-pink-900
                   outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Channel</label>
          <select
              v-model="newRem.channel"
              class="w-full px-3 py-2.5 rounded-xl border border-pink-200 bg-white text-xs text-pink-900
                   outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all cursor-pointer"
          >
            <option value="push">🔔 Push</option>
            <option value="email">📧 Email</option>
            <option value="sms">💬 SMS</option>
          </select>
        </div>
      </div>

      <button
          @click="handleAdd"
          :disabled="saving || !newRem.trigger_at"
          class="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white
               bg-gradient-to-r from-pink-400 to-pink-500 shadow-pink
               hover:opacity-90 transition-all cursor-pointer border-none
               disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i v-if="saving" class="pi pi-spinner pi-spin" /><i v-else class="pi pi-plus" />
        Add Reminder
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="flex flex-col gap-2">
      <div v-for="i in 2" :key="i" class="skeleton h-14 rounded-xl" />
    </div>

    <!-- Empty -->
    <div v-else-if="remList.length === 0"
         class="flex flex-col items-center gap-2 py-6 text-center">
      <i class="pi pi-bell text-3xl text-pink-200" />
      <p class="text-xs text-pink-900/40">No reminders yet for this task</p>
    </div>

    <!-- List -->
    <TransitionGroup v-else tag="div" name="fade" class="flex flex-col gap-2">
      <div
          v-for="rem in remList" :key="rem.id"
          :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl border border-pink-100 bg-white',
          rem.is_sent ? 'opacity-50' : ''
        ]"
      >
        <!-- Channel icon -->
        <div :class="['w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm shrink-0', channelBg(rem.channel)]">
          <i :class="channelIcon(rem.channel)" />
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-pink-900">{{ formatDt(rem.trigger_at) }}</p>
          <p class="text-[11px] text-pink-900/40 mt-0.5">
            {{ rem.channel || 'push' }} · {{ rem.is_sent ? '✅ Sent' : '⏳ Pending' }}
          </p>
        </div>

        <div class="flex gap-2 shrink-0">
          <button
              v-if="!rem.is_sent"
              @click="handleSnooze(rem)"
              title="Snooze 10 min"
              class="p-2 rounded-lg border border-pink-200 text-pink-400 bg-white
                   hover:bg-pink-50 hover:border-pink-300 transition-all cursor-pointer text-xs"
          >
            <i class="pi pi-clock" />
          </button>
          <button
              @click="handleDelete(rem)"
              title="Delete"
              class="p-2 rounded-lg border border-pink-200 text-pink-300 bg-white
                   hover:bg-pink-100 hover:border-pink-300 hover:text-pink-600 transition-all cursor-pointer text-xs"
          >
            <i class="pi pi-trash" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRemindersStore } from '@/stores/reminders'
import { useToast } from 'primevue/usetoast'

const props      = defineProps({ task: Object })
const remStore   = useRemindersStore()
const toast      = useToast()
const loading    = ref(false)
const saving     = ref(false)
const newRem     = ref({ trigger_at: '', channel: 'push' })

const remList = computed(() => remStore.remindersByTask[props.task.id] || [])

function channelIcon(ch) {
  return ch === 'email' ? 'pi pi-envelope' : ch === 'sms' ? 'pi pi-mobile' : 'pi pi-bell'
}
function channelBg(ch) {
  return ch === 'email' ? 'bg-gradient-to-br from-indigo-400 to-indigo-500'
      : ch === 'sms'   ? 'bg-gradient-to-br from-emerald-400 to-emerald-500'
          : 'bg-gradient-to-br from-pink-300 to-pink-400'
}
function formatDt(dt) {
  return new Date(dt).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

async function handleAdd() {
  if (!newRem.value.trigger_at) return
  saving.value = true
  try {
    await remStore.createReminder(props.task.id, {
      trigger_at: new Date(newRem.value.trigger_at).toISOString(),
      channel: newRem.value.channel
    })
    newRem.value = { trigger_at: '', channel: 'push' }
    toast.add({ severity: 'success', summary: '🔔 Reminder set!', life: 2000 })
  } finally { saving.value = false }
}

async function handleDelete(rem) {
  await remStore.deleteReminder(props.task.id, rem.id)
  toast.add({ severity: 'info', summary: 'Deleted', life: 2000 })
}

async function handleSnooze(rem) {
  await remStore.snoozeReminder(props.task.id, rem.id, 10)
  toast.add({ severity: 'info', summary: '⏰ Snoozed 10 min', life: 2000 })
}

onMounted(async () => {
  loading.value = true
  await remStore.fetchReminders(props.task.id)
  loading.value = false
})
</script>