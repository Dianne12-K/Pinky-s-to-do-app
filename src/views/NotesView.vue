<template>
  <div class="flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-3xl text-pink-900">My Notes 📝</h1>
        <p class="text-sm text-pink-900/40 mt-1">
          {{ notesStore.pinned.length }} pinned · {{ notesStore.unpinned.length }} unpinned
        </p>
      </div>
      <button
          @click="openCreate"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
               bg-gradient-to-r from-pink-400 to-pink-500 shadow-pink
               hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 border-none cursor-pointer"
      >
        <i class="pi pi-plus" /> New Note
      </button>
    </div>

    <!-- Search + color filter -->
    <div class="bg-white rounded-2xl border border-pink-100 shadow-card px-5 py-4 flex flex-wrap gap-4 items-center">
      <div class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 text-xs" />
        <input
            v-model="search"
            placeholder="Search notes..."
            class="pl-8 pr-4 py-2 rounded-xl border border-pink-200 bg-white text-xs text-pink-900
                 placeholder-pink-200 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all w-48"
        />
      </div>

      <!-- Color filter dots -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-pink-900/40 font-medium">Filter:</span>
        <button
            @click="activeColor = ''"
            :class="['w-6 h-6 rounded-full border-2 transition-all cursor-pointer bg-white',
                   activeColor === '' ? 'border-pink-400 scale-110' : 'border-pink-200']"
            title="All"
        />
        <button
            v-for="c in colors" :key="c.value"
            @click="activeColor = activeColor === c.value ? '' : c.value"
            :class="['w-6 h-6 rounded-full border-2 transition-all cursor-pointer', c.bg,
                   activeColor === c.value ? 'border-pink-500 scale-110' : 'border-transparent']"
            :title="c.label"
        />
      </div>

      <label class="flex items-center gap-2 cursor-pointer ml-auto">
        <input v-model="pinnedOnly" type="checkbox" class="accent-pink-400 w-4 h-4" />
        <span class="text-xs text-pink-900/60 font-medium">Pinned only</span>
      </label>
    </div>

    <!-- Loading -->
    <div v-if="notesStore.loading" class="flex flex-col gap-3">
      <div v-for="i in 4" :key="i" class="skeleton h-24 rounded-2xl" />
    </div>

    <!-- Empty -->
    <div
        v-else-if="filtered.length === 0"
        class="bg-white rounded-2xl border border-pink-100 shadow-card flex flex-col items-center justify-center py-20 gap-3"
    >
      <span class="text-5xl">📝</span>
      <h3 class="font-display text-xl text-pink-900">No notes yet</h3>
      <p class="text-sm text-pink-900/40">Capture your thoughts, ideas and plans</p>
      <button
          @click="openCreate"
          class="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
               bg-gradient-to-r from-pink-400 to-pink-500 shadow-pink hover:opacity-90 transition-all border-none cursor-pointer"
      >
        <i class="pi pi-plus" /> Add note
      </button>
    </div>

    <!-- Notes list -->
    <div v-else class="flex flex-col gap-3">

      <!-- Pinned section -->
      <div v-if="pinnedFiltered.length">
        <p class="text-xs font-bold uppercase tracking-widest text-pink-900/40 mb-2 flex items-center gap-1">
          <i class="pi pi-thumbtack text-pink-400" /> Pinned
        </p>
        <TransitionGroup tag="div" name="fade" class="flex flex-col gap-3">
          <NoteRow
              v-for="note in pinnedFiltered" :key="note.id"
              :note="note"
              :tasks="tasksStore.tasks"
              @pin="notesStore.togglePin(note.id)"
              @edit="openEdit(note)"
              @delete="handleDelete(note)"
          />
        </TransitionGroup>
      </div>

      <!-- All / Unpinned section -->
      <div v-if="unpinnedFiltered.length">
        <p v-if="pinnedFiltered.length" class="text-xs font-bold uppercase tracking-widest text-pink-900/40 mb-2 mt-2">
          Others
        </p>
        <TransitionGroup tag="div" name="fade" class="flex flex-col gap-3">
          <NoteRow
              v-for="note in unpinnedFiltered" :key="note.id"
              :note="note"
              :tasks="tasksStore.tasks"
              @pin="notesStore.togglePin(note.id)"
              @edit="openEdit(note)"
              @delete="handleDelete(note)"
          />
        </TransitionGroup>
      </div>
    </div>

    <!-- ── Note form modal ─────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
            v-if="showForm"
            class="fixed inset-0 z-[200] flex items-center justify-center p-5
                 bg-pink-900/30 backdrop-blur-md"
            @click.self="closeForm"
        >
          <div class="w-full max-w-lg bg-white rounded-2xl border border-pink-100 shadow-hover p-8 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <h2 class="font-display text-xl text-pink-900">
                {{ editingNote ? 'Edit Note' : 'New Note' }} 📝
              </h2>
              <button
                  @click="closeForm"
                  class="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 text-pink-300
                       flex items-center justify-center hover:bg-pink-100 hover:text-pink-500
                       transition-all cursor-pointer"
              >
                <i class="pi pi-times text-sm" />
              </button>
            </div>
            <NoteForm
                :note="editingNote"
                :tasks="tasksStore.tasks"
                @saved="handleSaved"
                @cancel="closeForm"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useTasksStore } from '@/stores/tasks'
import { useToast } from 'primevue/usetoast'
import NoteRow  from '@/components/NoteRow.vue'
import NoteForm from '@/components/NoteForm.vue'

const notesStore = useNotesStore()
const tasksStore = useTasksStore()
const toast      = useToast()

const showForm   = ref(false)
const editingNote = ref(null)
const search     = ref('')
const activeColor = ref('')
const pinnedOnly  = ref(false)

const colors = [
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-300' },
  { value: 'pink',   label: 'Pink',   bg: 'bg-pink-300'   },
  { value: 'green',  label: 'Green',  bg: 'bg-green-300'  },
  { value: 'blue',   label: 'Blue',   bg: 'bg-blue-300'   },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-300' },
]

const filtered = computed(() =>
    notesStore.notes.filter(n => {
      if (pinnedOnly.value && !n.is_pinned) return false
      if (activeColor.value && n.color !== activeColor.value) return false
      if (search.value) {
        const q = search.value.toLowerCase()
        if (!n.title?.toLowerCase().includes(q) && !n.content?.toLowerCase().includes(q)) return false
      }
      return true
    })
)

const pinnedFiltered   = computed(() => filtered.value.filter(n => n.is_pinned))
const unpinnedFiltered = computed(() => filtered.value.filter(n => !n.is_pinned))

function openCreate() { editingNote.value = null; showForm.value = true }
function openEdit(note) { editingNote.value = { ...note }; showForm.value = true }
function closeForm() { showForm.value = false; editingNote.value = null }

async function handleDelete(note) {
  await notesStore.deleteNote(note.id)
  toast.add({ severity: 'info', summary: 'Deleted', detail: 'Note removed', life: 2000 })
}

function handleSaved() {
  closeForm()
  toast.add({ severity: 'success', summary: '📝 Saved!', detail: 'Note saved successfully', life: 2500 })
}

onMounted(async () => {
  await notesStore.fetchNotes()
  await tasksStore.fetchTasks()
})
</script>