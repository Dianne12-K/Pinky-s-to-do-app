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
            { path: '',         name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
            { path: 'tasks',    name: 'Tasks',     component: () => import('@/views/TasksView.vue') },
            { path: 'reminders',name: 'Reminders', component: () => import('@/views/RemindersView.vue') },
            { path: 'notes',    name: 'Notes',     component: () => import('@/views/NotesView.vue') },
        ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, from, next) => {
    // Read directly from localStorage - always synchronous and reliable
    const hasToken = !!localStorage.getItem('token')

    if (to.meta.requiresAuth && !hasToken) return next('/login')
    if (to.meta.guest && hasToken)         return next('/')

    next()
})

export default router