<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">

    <!-- Title -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Title</label>
      <input
          v-model="form.title"
          placeholder="Note title..."
          class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white text-sm text-pink-900
               placeholder-pink-200 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
      />
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Content *</label>
      <textarea
          v-model="form.content" required rows="5"
          placeholder="Write your thoughts..."
          class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white text-sm text-pink-900
               placeholder-pink-200 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100
               transition-all resize-y min-h-[120px]"
      />
    </div>

    <!-- Color picker -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">Color</label>
      <div class="flex gap-2 flex-wrap">
        <!-- No color option -->
        <button
            type="button"
            @click="form.color = ''"
            :class="[
            'w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center text-xs',
            form.color === '' ? 'border-pink-400 bg-pink-50' : 'border-pink-200 bg-white'
          ]"
            title="None"
        >
          <i class="pi pi-times text-pink-300 text-[10px]" />
        </button>

        <button
            v-for="c in colors" :key="c.value"
            type="button"
            @click="form.color = c.value"
            :class="[
            'w-8 h-8 rounded-full border-2 transition-all cursor-pointer', c.bg,
            form.color === c.value ? 'border-pink-500 scale-110 shadow-md' : 'border-transparent'
          ]"
            :title="c.label"
        />
      </div>

      <!-- Color preview strip -->
      <div
          v-if="form.color"
          :class="['h-1.5 rounded-full transition-all', colorStrip[form.color] || 'bg-pink-200']"
      />
    </div>

    <!-- Link to task -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wide text-pink-400">
        Link to Task <span class="normal-case font-normal text-pink-900/30">(optional)</span>
      </label>
      <select
          v-model="form.task_id"
          class="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white text-sm text-pink-900
               outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all cursor-pointer"
      >
        <option :value="null">— No task —</option>
        <option v-for="task in tasks" :key="task.id" :value="task.id">
          {{ task.title }}
        </option>
      </select>
    </div>

    <!-- Pin toggle -->
    <label class="flex items-center gap-2 cursor-pointer">
      <input v-model="form.is_pinned" type="checkbox" class="accent-pink-400 w-4 h-4" />
      <span class="text-sm text-pink-900/70 font-medium">📌 Pin this note</span>
    </label>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t border-pink-100">
      <button
          type="button" @click="$emit('cancel')"
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
        {{ saving ? 'Saving...' : note ? 'Update Note' : 'Create Note' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNotesStore } from '@/stores/notes'

const props = defineProps({
  note:  Object,
  tasks: { type: Array, default: () => [] }
})
const emit   = defineEmits(['saved', 'cancel'])
const notesStore = useNotesStore()
const saving = ref(false)

const colors = [
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-300' },
  { value: 'pink',   label: 'Pink',   bg: 'bg-pink-300'   },
  { value: 'green',  label: 'Green',  bg: 'bg-green-300'  },
  { value: 'blue',   label: 'Blue',   bg: 'bg-blue-300'   },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-300' },
]

const colorStrip = {
  yellow: 'bg-yellow-300',
  pink:   'bg-pink-300',
  green:  'bg-green-300',
  blue:   'bg-blue-300',
  purple: 'bg-purple-300',
}

const form = ref(buildForm(props.note))
watch(() => props.note, n => { form.value = buildForm(n) })

function buildForm(n) {
  return {
    title:     n?.title     || '',
    content:   n?.content   || '',
    color:     n?.color     || '',
    is_pinned: n?.is_pinned || false,
    task_id:   n?.task_id   || null,
  }
}

async function handleSubmit() {
  saving.value = true
  const payload = {
    ...form.value,
    task_id: form.value.task_id || null,
    color:   form.value.color   || null,
  }
  try {
    if (props.note) await notesStore.updateNote(props.note.id, payload)
    else await notesStore.createNote(payload)
    emit('saved')
  } finally {
    saving.value = false
  }
}
</script>