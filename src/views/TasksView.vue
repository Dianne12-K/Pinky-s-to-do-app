<template>
  <div class="flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-3xl text-pink-900">My Tasks 📋</h1>
        <p class="text-sm text-pink-900/40 mt-1">
          {{ tasksStore.pending.length }} pending · {{ tasksStore.completed.length }} completed
        </p>
      </div>
      <button
          @click="showForm = true"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
               bg-gradient-to-r from-pink-400 to-pink-500 shadow-pink
               hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 border-none cursor-pointer"
      >
        <i class="pi pi-plus" /> New Task
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-pink-100 shadow-card px-5 py-4
                flex flex-wrap items-center gap-4">
      <!-- Status tabs -->
      <div class="flex gap-2 flex-wrap">
        <button
            v-for="s in statuses" :key="s.value"
            @click="activeStatus = s.value"
            :class="[
            'flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer',
            activeStatus === s.value
              ? 'bg-pink-400 border-pink-400 text-white'
              : 'border-pink-200 text-pink-900/50 bg-white hover:border-pink-300 hover:text-pink-500'
          ]"
        >
          {{ s.label }}
          <span :class="[
            'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
            activeStatus === s.value ? 'bg-white/30 text-white' : 'bg-pink-100 text-pink-500'
          ]">{{ s.count }}</span>
        </button>
      </div>

      <!-- Priority + search -->
      <div class="flex gap-3 flex-wrap ml-auto items-center">
        <select
            v-model="activePriority"
            class="px-3 py-2 rounded-xl border border-pink-200 bg-white text-xs text-pink-900
                 outline-none focus:border-pink-400 transition-all cursor-pointer"
        >
          <option value="">All priorities</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 text-xs" />
          <input
              v-model="search" placeholder="Search tasks..."
              class="pl-8 pr-4 py-2 rounded-xl border border-pink-200 bg-white text-xs text-pink-900
                   placeholder-pink-200 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all w-44"
          />
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="tasksStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="skeleton h-40 rounded-2xl" />
    </div>

    <!-- Empty state -->
    <div v-else-if="filtered.length === 0"
         class="bg-white rounded-2xl border border-pink-100 shadow-card flex flex-col items-center justify-center py-20 gap-3">
      <span class="text-5xl">🌸</span>
      <h3 class="font-display text-xl text-pink-900">No tasks here yet</h3>
      <p class="text-sm text-pink-900/40">Create your first task to get started!</p>
      <button
          @click="showForm = true"
          class="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
               bg-gradient-to-r from-pink-400 to-pink-500 shadow-pink hover:opacity-90 transition-all border-none cursor-pointer"
      >
        <i class="pi pi-plus" /> Add task
      </button>
    </div>

    <!-- Task grid -->
    <TransitionGroup
        v-else
        tag="div"
        name="fade"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <TaskCard
          v-for="task in filtered" :key="task.id"
          :task="task"
          @complete="handleComplete"
          @edit="openEdit"
          @delete="handleDelete"
          @reminders="openReminders"
      />
    </TransitionGroup>

    <!-- ── Task form modal ─────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
            v-if="showForm || editingTask"
            class="fixed inset-0 z-[200] flex items-center justify-center p-5
                 bg-pink-900/30 backdrop-blur-md"
            @click.self="closeForm"
        >
          <div class="w-full max-w-lg bg-white rounded-2xl border border-pink-100 shadow-hover p-8 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <h2 class="font-display text-xl text-pink-900">
                {{ editingTask ? 'Edit Task' : 'New Task' }} 🌸
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
            <TaskForm :task="editingTask" @saved="handleSaved" @cancel="closeForm" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Reminders modal ────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
            v-if="remindersTask"
            class="fixed inset-0 z-[200] flex items-center justify-center p-5
                 bg-pink-900/30 backdrop-blur-md"
            @click.self="remindersTask = null"
        >
          <div class="w-full max-w-lg bg-white rounded-2xl border border-pink-100 shadow-hover p-8 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-display text-xl text-pink-900">🔔 Reminders</h2>
              <button
                  @click="remindersTask = null"
                  class="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 text-pink-300
                       flex items-center justify-center hover:bg-pink-100 hover:text-pink-500
                       transition-all cursor-pointer"
              >
                <i class="pi pi-times text-sm" />
              </button>
            </div>
            <p class="text-xs italic text-pink-900/40 mb-5 pb-4 border-b border-pink-100">
              {{ remindersTask.title }}
            </p>
            <TaskReminders :task="remindersTask" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useToast } from 'primevue/usetoast'
import TaskCard      from '@/components/TaskCard.vue'
import TaskForm      from '@/components/TaskForm.vue'
import TaskReminders from '@/components/TaskReminders.vue'

const tasksStore = useTasksStore()
const toast      = useToast()

const showForm      = ref(false)
const editingTask   = ref(null)
const remindersTask = ref(null)
const activeStatus   = ref('')
const activePriority = ref('')
const search         = ref('')

const statuses = computed(() => [
  { value: '',            label: 'All',         count: tasksStore.tasks.length },
  { value: 'pending',     label: 'Pending',     count: tasksStore.pending.length },
  { value: 'in_progress', label: 'In Progress', count: tasksStore.inProgress.length },
  { value: 'completed',   label: 'Completed',   count: tasksStore.completed.length },
])

const filtered = computed(() =>
    tasksStore.tasks.filter(t => {
      if (activeStatus.value   && t.status   !== activeStatus.value)   return false
      if (activePriority.value && t.priority !== activePriority.value) return false
      if (search.value && !t.title.toLowerCase().includes(search.value.toLowerCase())) return false
      return true
    })
)

function openEdit(task)      { editingTask.value = { ...task } }
function openReminders(task) { remindersTask.value = task }
function closeForm()         { showForm.value = false; editingTask.value = null }

async function handleComplete(task) {
  await tasksStore.completeTask(task.id)
  toast.add({ severity: 'success', summary: '✅ Done!', detail: 'Task marked complete', life: 2500 })
}
async function handleDelete(task) {
  await tasksStore.deleteTask(task.id)
  toast.add({ severity: 'info', summary: 'Deleted', detail: task.title, life: 2500 })
}
function handleSaved() {
  closeForm()
  toast.add({ severity: 'success', summary: '🌸 Saved!', detail: 'Task saved successfully', life: 2500 })
}

onMounted(() => tasksStore.fetchTasks())
</script>