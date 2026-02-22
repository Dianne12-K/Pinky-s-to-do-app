import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTasks, createTask as apiCreate, updateTask as apiUpdate, deleteTask as apiDelete, completeTask as apiComplete } from '@/services/api'

export const useTasksStore = defineStore('tasks', () => {
    const tasks   = ref([])
    const loading = ref(false)
    const total   = ref(0)

    const pending    = computed(() => tasks.value.filter(t => t.status === 'pending'))
    const inProgress = computed(() => tasks.value.filter(t => t.status === 'in_progress'))
    const completed  = computed(() => tasks.value.filter(t => t.status === 'completed'))

    const todayTasks = computed(() => {
        const today = new Date().toDateString()
        return tasks.value.filter(t => t.due_date && new Date(t.due_date).toDateString() === today)
    })

    async function fetchTasks(params = {}) {
        loading.value = true
        try {
            const res = await getTasks({ per_page: 100, ...params })
            tasks.value = res.data.data?.tasks || res.data.data || []
            total.value = res.data.data?.total || tasks.value.length
        } finally {
            loading.value = false
        }
    }

    async function createTask(data) {
        const res = await apiCreate(data)
        const newTask = res.data.data
        tasks.value.unshift(newTask)
        return newTask
    }

    async function updateTask(id, data) {
        const res = await apiUpdate(id, data)
        const updated = res.data.data
        const idx = tasks.value.findIndex(t => t.id === id)
        if (idx !== -1) tasks.value[idx] = updated
        return updated
    }

    async function deleteTask(id) {
        await apiDelete(id)
        tasks.value = tasks.value.filter(t => t.id !== id)
    }

    async function completeTask(id) {
        const res = await apiComplete(id)
        const updated = res.data.data
        const idx = tasks.value.findIndex(t => t.id === id)
        if (idx !== -1) tasks.value[idx] = updated
        return updated
    }

    return {
        tasks, loading, total,
        pending, inProgress, completed, todayTasks,
        fetchTasks, createTask, updateTask, deleteTask, completeTask
    }
})