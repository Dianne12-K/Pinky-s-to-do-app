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
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/views/DashboardView.vue'),
            },
            {
                path: 'tasks',
                name: 'Tasks',
                component: () => import('@/views/TasksView.vue'),
            },
            {
                path: 'reminders',
                name: 'Reminders',
                component: () => import('@/views/RemindersView.vue'),
            },
            {
                path: 'notes',
                name: 'Notes',
                component: () => import('@/views/NotesView.vue'),
            },
        ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to, from, next) => {
    // Import inside the guard so Pinia is guaranteed to be initialised
    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()

    if (to.meta.requiresAuth) {
        if (!auth.isLoggedIn) return next('/login')
        if (!auth.user) await auth.fetchUser()
        return next()
    }

    if (to.meta.guest && auth.isLoggedIn) return next('/')

    next()
})

export default router