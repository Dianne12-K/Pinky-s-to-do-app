import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, getCurrentUser } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
    // Read token synchronously on store creation
    const token   = ref(localStorage.getItem('token') || null)
    const user    = ref(null)
    const loading = ref(false)

    const isLoggedIn = computed(() => !!token.value)

    async function login(email, password) {
        loading.value = true
        try {
            const res = await apiLogin({ email, password })
            const t = res.data.data.token
            const u = res.data.data.user
            token.value = t
            user.value  = u
            localStorage.setItem('token', t)
            return { success: true }
        } catch (e) {
            return { success: false, message: e.response?.data?.error || 'Login failed' }
        } finally {
            loading.value = false
        }
    }

    async function register(username, email, password) {
        loading.value = true
        try {
            await apiRegister({ username, email, password })
            return { success: true }
        } catch (e) {
            return { success: false, message: e.response?.data?.error || 'Registration failed' }
        } finally {
            loading.value = false
        }
    }

    async function fetchUser() {
        if (!token.value) return
        try {
            const res = await getCurrentUser()
            user.value = res.data.data
        } catch {
            logout()
        }
    }

    function logout() {
        token.value = null
        user.value  = null
        localStorage.removeItem('token')
    }

    return { user, token, loading, isLoggedIn, login, register, fetchUser, logout }
})