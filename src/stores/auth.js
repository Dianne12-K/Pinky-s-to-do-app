import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, getCurrentUser } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
    const token   = ref(localStorage.getItem('token') || null)
    const user    = ref(null)
    const loading = ref(false)

    const isLoggedIn = computed(() => !!token.value)

    async function login(email, password) {
        loading.value = true
        try {
            const res = await apiLogin({ email, password })

            // Use the nested data structure from your backend
            const t = res.data.data.token
            const u = res.data.data.user

            // 1. Update localStorage FIRST
            localStorage.setItem('token', t)

            // 2. Update the reactive state
            token.value = t
            console.log('✅ Token saved:', t)
            user.value  = u

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
        } catch (e) {
            // do nothing - don't logout on failed profile fetch
            console.warn('Could not fetch user:', e.message)
        }
    }
    function logout() {
        token.value = null
        user.value  = null
        localStorage.removeItem('token')
    }

    return { user, token, loading, isLoggedIn, login, register, fetchUser, logout }
})