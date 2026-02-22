import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, getCurrentUser } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
    const user    = ref(null)
    const token   = ref(localStorage.getItem('token') || null)
    const loading = ref(false)

    const isLoggedIn = computed(() => !!token.value)

    async function login(email, password) {
        loading.value = true
        try {
            const res = await apiLogin({ email, password })
            token.value = res.data.data.token
            user.value  = res.data.data.user
            localStorage.setItem('token', res.data.data.token)
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
        user.value  = null
        token.value = null
        localStorage.removeItem('token')
    }

    return { user, token, loading, isLoggedIn, login, register, fetchUser, logout }
})