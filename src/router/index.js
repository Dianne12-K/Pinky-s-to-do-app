import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginView.vue'), // Restored name
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/RegisterView.vue'), // Restored name
        meta: { requiresAuth: false }
    },
    {
        path: '/',
        component: () => import('@/layouts/AppLayout.vue'), // Restored name
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/views/DashboardView.vue')
            },
            {
                path: 'tasks',
                name: 'Tasks',
                component: () => import('@/views/TasksView.vue')
            },
            {
                path: 'reminders',
                name: 'Reminders',
                component: () => import('@/views/RemindersView.vue')
            },
            {
                path: 'notes',
                name: 'Notes',
                component: () => import('@/views/NotesView.vue')
            },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // SOURCE OF TRUTH: Check both the reactive store and the physical storage
    const hasToken = !!localStorage.getItem('token')
    const isAuthenticated = authStore.isLoggedIn || hasToken

    console.log(`Navigating to: ${to.name} | Authenticated: ${isAuthenticated}`)

    // 1. If route requires auth and user isn't logged in -> Login
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next({ name: 'Login' })
    }

    // 2. If user is logged in and tries to hit Login/Register -> Dashboard
    if (isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
        return next({ name: 'Dashboard' })
    }

    // 3. Otherwise, proceed
    next()
})

export default router