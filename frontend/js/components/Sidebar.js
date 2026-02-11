// Sidebar Component
const SidebarComponent = {
  template: `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span>🧠</span>
        <span>MindSupport</span>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/dashboard" :class="['nav-item', { active: activeMenu === 'dashboard' }]">
          <span class="icon">🏠</span>
          <span>Dashboard</span>
        </router-link>
        
        <router-link to="/chat" :class="['nav-item', { active: activeMenu === 'chat' }]">
          <span class="icon">🤖</span>
          <span>Chat Konseling</span>
        </router-link>
        
        <router-link to="/forum" :class="['nav-item', { active: activeMenu === 'forum' }]">
          <span class="icon">💬</span>
          <span>Forum Berbagi</span>
        </router-link>
        
        <router-link to="/journal" :class="['nav-item', { active: activeMenu === 'journal' }]">
          <span class="icon">📔</span>
          <span>Riwayat Journal</span>
        </router-link>
        
        <router-link to="/profile" :class="['nav-item', { active: activeMenu === 'profile' }]">
          <span class="icon">👤</span>
          <span>Profil</span>
        </router-link>
        
        <div v-if="isAdmin" class="nav-divider"></div>
        
        <router-link v-if="isAdmin" to="/admin" :class="['nav-item', { active: activeMenu === 'admin' }]">
          <span class="icon">🛡️</span>
          <span>Admin Panel</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">{{ userInitials }}</div>
          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <span class="user-id">{{ anonymousId }}</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  props: {
    activeMenu: {
      type: String,
      default: 'dashboard'
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    userName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.name || 'User';
    },
    userInitials() {
      const name = this.userName;
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    anonymousId() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.anonymousId || 'Anonim#???';
    }
  }
};
