<template>
  <div
      :class="[
      'bg-white rounded-2xl border border-pink-100 shadow-card p-5 flex flex-col gap-3',
      'hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden',
      task.status === 'completed' ? 'opacity-60' : ''
    ]"
  >
    <!-- Left accent bar -->
    <div
        class="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
        :style="`background: ${accentColor}`"
    />

    <!-- Badges row -->
    <div class="flex gap-2 flex-wrap pl-1">
      <PriorityBadge :priority="task.priority" />
      <StatusBadge   :status="task.status" />
    </div>

    <!-- Title -->
    <h3 :class="[
      'font-semibold text-sm text-pink-900 leading-snug pl-1',
      task.status === 'completed' ? 'line-through text-pink-900/40' : ''
    ]">{{ task.title }}</h3>

    <!-- Description -->
    <p v-if="task.description"
       class="text-xs text-pink-900/50 leading-relaxed line-clamp-2 pl-1">
      {{ task.description }}
    </p>

    <!-- Meta -->
    <div class="flex flex-wrap gap-3 pl-1">
      <span v-if="task.due_date" :class="[
        'flex items-center gap-1 text-[11px] font-medium',
        isOverdue ? 'text-pink-600' : 'text-pink-900/40'
      ]">
        <i class="pi pi-calendar text-[11px]" />
        {{ formatDate(task.due_date) }}
      </span>
      <span v-if="task.is_recurring" class="flex items-center gap-1 text-[11px] text-pink-900/40 font-medium">
        <i class="pi pi-refresh text-[11px]" /> {{ task.recurrence_rule }}
      </span>
      <span v-if="task.reminders?.length" class="flex items-center gap-1 text-[11px] text-pink-900/40 font-medium">
        <i class="pi pi-bell text-[11px]" />
        {{ task.reminders.length }} reminder{{ task.reminders.length > 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 flex-wrap pt-1 border-t border-pink-50">
      <button
          v-if="task.status !== 'completed'"
          @click="$emit('complete', task)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
               bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-pink
               hover:opacity-90 transition-all cursor-pointer border-none"
      >
        <i class="pi pi-check text-xs" /> Done
      </button>

      <button
          @click="$emit('reminders', task)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
               border border-pink-200 text-pink-400 bg-white hover:bg-pink-50 hover:border-pink-300
               transition-all cursor-pointer"
      >
        <i class="pi pi-bell text-xs" />
      </button>

      <button
          @click="$emit('edit', task)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
               border border-pink-200 text-pink-400 bg-white hover:bg-pink-50 hover:border-pink-300
               transition-all cursor-pointer"
      >
        <i class="pi pi-pencil text-xs" />
      </button>

      <button
          @click="$emit('delete', task)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
               border border-pink-200 text-pink-300 bg-white hover:bg-pink-100 hover:border-pink-300 hover:text-pink-600
               transition-all cursor-pointer ml-auto"
      >
        <i class="pi pi-trash text-xs" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PriorityBadge from './PriorityBadge.vue'
import StatusBadge   from './StatusBadge.vue'

const props = defineProps({ task: Object })
defineEmits(['complete', 'edit', 'delete', 'reminders'])

const accentColor = computed(() => ({
  high: '#f7608e', medium: '#f59e0b', low: '#22c55e'
})[props.task.priority] || '#f7608e')

const isOverdue = computed(() =>
    props.task.due_date &&
    props.task.status !== 'completed' &&
    new Date(props.task.due_date) < new Date()
)

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>