import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getReminders, createReminder as apiCreate, deleteReminder as apiDelete, snoozeReminder as apiSnooze } from '@/services/api'

export const useRemindersStore = defineStore('reminders', () => {
    const remindersByTask = ref({})
    const loading = ref(false)

    async function fetchReminders(taskId) {
        loading.value = true
        try {
            const res = await getReminders(taskId)
            remindersByTask.value[taskId] = res.data.data || []
        } finally {
            loading.value = false
        }
    }

    async function createReminder(taskId, data) {
        const res = await apiCreate(taskId, data)
        const newRem = res.data.data
        if (!remindersByTask.value[taskId]) remindersByTask.value[taskId] = []
        remindersByTask.value[taskId].push(newRem)
        return newRem
    }

    async function deleteReminder(taskId, remId) {
        await apiDelete(taskId, remId)
        if (remindersByTask.value[taskId]) {
            remindersByTask.value[taskId] = remindersByTask.value[taskId].filter(r => r.id !== remId)
        }
    }

    async function snoozeReminder(taskId, remId, minutes = 10) {
        const res = await apiSnooze(taskId, remId, minutes)
        const updated = res.data.data
        if (remindersByTask.value[taskId]) {
            const idx = remindersByTask.value[taskId].findIndex(r => r.id === remId)
            if (idx !== -1) remindersByTask.value[taskId][idx] = updated
        }
        return updated
    }

    // All upcoming reminders across all fetched tasks
    function allUpcoming() {
        const now = new Date()
        return Object.values(remindersByTask.value)
            .flat()
            .filter(r => !r.is_sent && new Date(r.trigger_at) > now)
            .sort((a, b) => new Date(a.trigger_at) - new Date(b.trigger_at))
    }

    return { remindersByTask, loading, fetchReminders, createReminder, deleteReminder, snoozeReminder, allUpcoming }
})