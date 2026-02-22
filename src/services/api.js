import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://pinkys-backend-todo.onrender.com/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor — attach token
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear the bad token
            localStorage.removeItem('token')
            // Redirect to login if not already there
            if (router.currentRoute.value.name !== 'Login') {
                router.push({ name: 'Login' })
            }
        }
        return Promise.reject(error)
    }
)
// Response interceptor — DO NOT auto-logout on 401
// Let each store/component decide what to do with errors
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
)

// ─── Auth ─────────────────────────────────────────────────────────────────
export const login          = (credentials) => api.post('/auth/login', credentials)
export const register       = (userData)    => api.post('/auth/register', userData)
export const getCurrentUser = ()            => api.get('/auth/me')

// ─── Tasks ────────────────────────────────────────────────────────────────
export const getTasks     = (params)       => api.get('/tasks/', { params })
export const getTask      = (id)           => api.get(`/tasks/${id}`)
export const createTask   = (data)         => api.post('/tasks/', data)
export const updateTask   = (id, data)     => api.put(`/tasks/${id}`, data)
export const deleteTask   = (id)           => api.delete(`/tasks/${id}`)
export const completeTask = (id)           => api.patch(`/tasks/${id}/complete`)

// ─── Reminders ────────────────────────────────────────────────────────────
export const getReminders   = (taskId)              => api.get(`/tasks/${taskId}/reminders`)
export const createReminder = (taskId, data)        => api.post(`/tasks/${taskId}/reminders`, data)
export const deleteReminder = (taskId, remId)       => api.delete(`/tasks/${taskId}/reminders/${remId}`)
export const snoozeReminder = (taskId, remId, mins) => api.patch(`/tasks/${taskId}/reminders/${remId}/snooze`, { minutes: mins })

// ─── Notes ────────────────────────────────────────────────────────────────
export const getNotes   = (params)     => api.get('/notes/', { params })
export const getNote    = (id)         => api.get(`/notes/${id}`)
export const createNote = (data)       => api.post('/notes/', data)
export const updateNote = (id, data)   => api.put(`/notes/${id}`, data)
export const deleteNote = (id)         => api.delete(`/notes/${id}`)
export const pinNote    = (id)         => api.patch(`/notes/${id}/pin`)

export default api