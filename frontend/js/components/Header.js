// Header Component
const HeaderComponent = {
    template: `
    <header class="header">
      <div class="header-left">
        <button v-if="showBack" class="btn btn-ghost btn-icon" @click="goBack">
          ←
        </button>
        <h1 class="header-title">{{ title }}</h1>
      </div>
      
      <div class="header-right">
        <slot name="actions"></slot>
        
        <button class="btn btn-ghost btn-icon" @click="toggleNotifications">
          🔔
          <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
        </button>
        
        <div class="user-dropdown" @click="toggleDropdown">
          <div class="avatar">{{ userInitials }}</div>
          
          <div v-if="showDropdown" class="dropdown-menu">
            <router-link to="/profile" class="dropdown-item">
              👤 Profil
            </router-link>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" @click.prevent="logout">
              🚪 Keluar
            </a>
          </div>
        </div>
      </div>
    </header>
  `,
    props: {
        title: {
            type: String,
            default: 'Dashboard'
        },
        showBack: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showDropdown: false,
            notificationCount: 2
        }
    },
    computed: {
        userInitials() {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const name = user.name || 'User';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
    },
    methods: {
        goBack() {
            this.$router.back();
        },
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        toggleNotifications() {
            // In real app, show notifications panel
            alert('Notifikasi akan ditampilkan di sini');
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.$router.push('/login');
        }
    },
    mounted() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                this.showDropdown = false;
            }
        });
    }
};
