<template>
  <div
      :class="[
      'flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200',
      'hover:shadow-hover hover:-translate-y-0.5 group',
      colorStyles[note.color]?.border || 'border-pink-100',
      colorStyles[note.color]?.bg     || 'bg-white',
    ]"
  >
    <!-- Color strip -->
    <div :class="['w-1 self-stretch rounded-full shrink-0', colorStyles[note.color]?.strip || 'bg-pink-300']" />

    <!-- Body -->
    <div class="flex-1 min-w-0">

      <!-- Title row -->
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-semibold text-sm text-pink-900 leading-snug">
          {{ note.title || 'Untitled' }}
        </h3>
        <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <!-- Pin -->
          <button
              @click="$emit('pin')"
              :title="note.is_pinned ? 'Unpin' : 'Pin'"
              :class="[
              'w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer border-none',
              note.is_pinned
                ? 'bg-pink-400 text-white'
                : 'bg-pink-50 text-pink-300 hover:bg-pink-100 hover:text-pink-500'
            ]"
          >
            <i class="pi pi-thumbtack" />
          </button>
          <!-- Edit -->
          <button
              @click="$emit('edit')"
              class="w-7 h-7 rounded-lg bg-pink-50 text-pink-300 flex items-center justify-center text-xs
                   hover:bg-pink-100 hover:text-pink-500 transition-all cursor-pointer border-none"
          >
            <i class="pi pi-pencil" />
          </button>
          <!-- Delete -->
          <button
              @click="$emit('delete')"
              class="w-7 h-7 rounded-lg bg-pink-50 text-pink-300 flex items-center justify-center text-xs
                   hover:bg-pink-100 hover:text-pink-600 transition-all cursor-pointer border-none"
          >
            <i class="pi pi-trash" />
          </button>
        </div>
      </div>

      <!-- Content preview -->
      <p v-if="note.content" class="text-xs text-pink-900/50 mt-1.5 leading-relaxed line-clamp-2">
        {{ note.content }}
      </p>

      <!-- Footer: linked task + date + color badge -->
      <div class="flex items-center gap-3 mt-3 flex-wrap">
        <span v-if="linkedTask"
              class="flex items-center gap-1 text-[10px] font-medium text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">
          <i class="pi pi-link text-[10px]" /> {{ linkedTask.title }}
        </span>

        <span v-if="note.color"
              :class="['text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full', colorStyles[note.color]?.badge]">
          {{ note.color }}
        </span>

        <span class="text-[10px] text-pink-900/30 ml-auto">
          {{ formatDate(note.updated_at || note.created_at) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  note:  Object,
  tasks: { type: Array, default: () => [] }
})
defineEmits(['pin', 'edit', 'delete'])

const colorStyles = {
  yellow: { bg: 'bg-yellow-50',  border: 'border-yellow-200', strip: 'bg-yellow-300', badge: 'bg-yellow-100 text-yellow-700' },
  pink:   { bg: 'bg-pink-50',    border: 'border-pink-200',   strip: 'bg-pink-300',   badge: 'bg-pink-100 text-pink-600'    },
  green:  { bg: 'bg-green-50',   border: 'border-green-200',  strip: 'bg-green-300',  badge: 'bg-green-100 text-green-700'  },
  blue:   { bg: 'bg-blue-50',    border: 'border-blue-200',   strip: 'bg-blue-300',   badge: 'bg-blue-100 text-blue-700'    },
  purple: { bg: 'bg-purple-50',  border: 'border-purple-200', strip: 'bg-purple-300', badge: 'bg-purple-100 text-purple-700'},
}

const linkedTask = computed(() =>
    props.note.task_id ? props.tasks.find(t => t.id === props.note.task_id) : null
)

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>