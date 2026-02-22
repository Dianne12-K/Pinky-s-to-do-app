<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">

    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Title *</label>
      <input
          v-model="form.title" required placeholder="What needs to be done?"
          class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white text-sm text-pink-900
               placeholder-pink-200 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Description</label>
      <textarea
          v-model="form.description" rows="3" placeholder="Add some details..."
          class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white text-sm text-pink-900
               placeholder-pink-200 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100
               transition-all resize-y min-h-[80px]"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Priority</label>
        <select
            v-model="form.priority"
            class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white text-sm text-pink-900
                 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all cursor-pointer"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>

      <div v-if="task" class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Status</label>
        <select
            v-model="form.status"
            class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white text-sm text-pink-900
                 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all cursor-pointer"
        >
          <option value="pending">⏳ Pending</option>
          <option value="in_progress">🔄 In Progress</option>
          <option value="completed">✅ Completed</option>
        </select>
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Due Date</label>
      <input
          v-model="form.due_date" type="datetime-local"
          class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white text-sm text-pink-900
               outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
      />
    </div>

    <!-- Recurring toggle -->
    <div class="flex items-center gap-4">
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="form.is_recurring" type="checkbox" class="accent-pink-400 w-4 h-4" />
        <span class="text-sm text-pink-900/70 font-medium">Recurring task?</span>
      </label>

      <select
          v-if="form.is_recurring"
          v-model="form.recurrence_rule"
          class="flex-1 px-4 py-2 rounded-xl border border-pink-200 bg-white text-sm text-pink-900
               outline-none focus:border-pink-400 transition-all cursor-pointer"
      >
        <option value="daily">📅 Daily</option>
        <option value="weekly">📆 Weekly</option>
        <option value="monthly">🗓 Monthly</option>
      </select>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t border-pink-100">
      <button
          type="button"
          @click="$emit('cancel')"
          class="px-5 py-2.5 rounded-xl border border-pink-200 text-pink-400 text-sm font-medium
               hover:bg-pink-50 hover:border-pink-300 transition-all cursor-pointer bg-white"
      >
        Cancel
      </button>
      <button
          type="submit" :disabled="saving"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
               bg-gradient-to-r from-pink-400 to-pink-500 shadow-pink
               hover:opacity-90 transition-all cursor-pointer border-none
               disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <i v-if="saving" class="pi pi-spinner pi-spin" />
        {{ saving ? 'Saving...' : task ? 'Update Task' : 'Create Task' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTasksStore } from '@/stores/tasks'

const props  = defineProps({ task: Object })
const emit   = defineEmits(['saved', 'cancel'])
const tasksStore = useTasksStore()
const saving = ref(false)

const form = ref(buildForm(props.task))
watch(() => props.task, t => { form.value = buildForm(t) })

function buildForm(t) {
  return {
    title:           t?.title          || '',
    description:     t?.description    || '',
    priority:        t?.priority       || 'medium',
    status:          t?.status         || 'pending',
    due_date:        t?.due_date ? toLocalInput(t.due_date) : '',
    is_recurring:    t?.is_recurring   || false,
    recurrence_rule: t?.recurrence_rule || 'weekly',
  }
}

function toLocalInput(iso) {
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

async function handleSubmit() {
  saving.value = true
  const payload = {
    ...form.value,
    due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null,
    recurrence_rule: form.value.is_recurring ? form.value.recurrence_rule : null,
  }
  try {
    if (props.task) await tasksStore.updateTask(props.task.id, payload)
    else await tasksStore.createTask(payload)
    emit('saved')
  } finally {
    saving.value = false
  }
}
</script>