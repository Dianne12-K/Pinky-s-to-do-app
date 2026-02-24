import axios from 'axios'
import router from '@/router' // Import your router to allow auto-redirects

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://pinkys-backend-todo.onrender.com/api',
    headers: { 'Content-Type': 'application/json' }
})

// ─── REQUEST INTERCEPTOR ───────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`)
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ─── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            router.currentRoute.value.name !== 'Login' &&
            localStorage.getItem('token')
        ) {
            localStorage.removeItem('token')
            router.replace({ name: 'Login' })
        }
        return Promise.reject(error)
    }
)

// ─── AUTH ──────────────────────────────────────────────────────────────────
export const login          = (credentials) => api.post('/auth/login', credentials)
export const register       = (userData)    => api.post('/auth/register', userData)
export const getCurrentUser  = ()             => api.get('/auth/me')

// ─── TASKS ─────────────────────────────────────────────────────────────────
export const getTasks     = (params)     => api.get('/tasks/', { params })
export const getTask      = (id)         => api.get(`/tasks/${id}`)
export const createTask   = (data)       => api.post('/tasks/', data)
export const updateTask   = (id, data)   => api.put(`/tasks/${id}`, data)
export const deleteTask   = (id)         => api.delete(`/tasks/${id}`)
export const completeTask = (id)         => api.patch(`/tasks/${id}/complete`)

// ─── REMINDERS ─────────────────────────────────────────────────────────────
export const getReminders   = (taskId)           => api.get(`/tasks/${taskId}/reminders`)
export const createReminder = (taskId, data)     => api.post(`/tasks/${taskId}/reminders`, data)
export const deleteReminder = (taskId, remId)    => api.delete(`/tasks/${taskId}/reminders/${remId}`)
export const snoozeReminder = (taskId, remId, mins) => api.patch(`/tasks/${taskId}/reminders/${remId}/snooze`, { minutes: mins })

// ─── NOTES ─────────────────────────────────────────────────────────────────
export const getNotes   = (params)   => api.get('/notes/', { params })
export const getNote    = (id)       => api.get(`/notes/${id}`)
export const createNote = (data)     => api.post('/notes/', data)
export const updateNote = (id, data) => api.put(`/notes/${id}`, data)
export const deleteNote = (id)       => api.delete(`/notes/${id}`)
export const pinNote    = (id)       => api.patch(`/notes/${id}/pin`)

export default api