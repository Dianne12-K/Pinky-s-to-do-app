import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getNotes, getNote, createNote as apiCreate, updateNote as apiUpdate, deleteNote as apiDelete, pinNote as apiPin } from '@/services/api'

export const useNotesStore = defineStore('notes', () => {
    const notes   = ref([])
    const loading = ref(false)

    const pinned   = computed(() => notes.value.filter(n => n.is_pinned))
    const unpinned = computed(() => notes.value.filter(n => !n.is_pinned))

    async function fetchNotes(params = {}) {
        loading.value = true
        try {
            const res = await getNotes({ per_page: 100, ...params })
            notes.value = res.data.data?.notes || res.data.data || []
        } finally {
            loading.value = false
        }
    }

    async function createNote(data) {
        const res = await apiCreate(data)
        const newNote = res.data.data
        notes.value.unshift(newNote)
        return newNote
    }

    async function updateNote(id, data) {
        const res = await apiUpdate(id, data)
        const updated = res.data.data
        const idx = notes.value.findIndex(n => n.id === id)
        if (idx !== -1) notes.value[idx] = updated
        return updated
    }

    async function deleteNote(id) {
        await apiDelete(id)
        notes.value = notes.value.filter(n => n.id !== id)
    }

    async function togglePin(id) {
        const res = await apiPin(id)
        const updated = res.data.data
        const idx = notes.value.findIndex(n => n.id === id)
        if (idx !== -1) notes.value[idx] = updated
        return updated
    }

    return { notes, loading, pinned, unpinned, fetchNotes, createNote, updateNote, deleteNote, togglePin }
})