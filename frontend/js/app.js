// MindSupport - Main Application

const { createApp, ref, computed, onMounted } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// Define routes
const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login,
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        component: Register,
        meta: { requiresAuth: false }
    },
    {
        path: '/dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/chat',
        component: Chat,
        meta: { requiresAuth: true }
    },
    {
        path: '/forum',
        component: Forum,
        meta: { requiresAuth: true }
    },
    {
        path: '/journal',
        component: Journal,
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        component: Profile,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin',
        component: Admin,
        meta: { requiresAuth: true, requiresAdmin: true }
    }
];

// Create router
const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
        next('/dashboard');
    } else {
        next();
    }
});

// Create app
const app = createApp({
    data() {
        return {
            appName: 'MindSupport'
        }
    }
});

// Register global components
app.component('sidebar-component', SidebarComponent);
app.component('header-component', HeaderComponent);
app.component('chat-message', ChatMessage);
app.component('post-card', PostCard);
app.component('modal-component', ModalComponent);

// Use router
app.use(router);

// Mount app
app.mount('#app');

console.log('🧠 MindSupport App Initialized');
