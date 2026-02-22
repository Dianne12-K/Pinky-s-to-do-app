import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginView.vue'),
        meta: { guest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/RegisterView.vue'),
        meta: { guest: true }
    },
    {
        path: '/',
        component: () => import('@/layouts/AppLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            { path: '',          name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
            { path: 'tasks',     name: 'Tasks',     component: () => import('@/views/TasksView.vue') },
            { path: 'reminders', name: 'Reminders', component: () => import('@/views/RemindersView.vue') },
            { path: 'notes',     name: 'Notes',     component: () => import('@/views/NotesView.vue') },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, from, next) => {
    const hasToken = !!localStorage.getItem('token')

    // Route needs auth and user has no token → send to login
    if (to.meta.requiresAuth && !hasToken) {
        return next({ name: 'Login' })
    }

    // Route is guest-only and user IS logged in → send to dashboard
    if (to.meta.guest && hasToken) {
        return next({ name: 'Dashboard' })
    }

    // All good
    next()
})

export default router