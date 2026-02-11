// Admin Dashboard Page Component - Modern Design
const Admin = {
  template: `
    <div class="min-h-screen bg-background-light dark:bg-background-dark flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark hidden md:flex flex-col h-screen sticky top-0">
        <!-- Logo Area -->
        <div class="h-16 flex items-center gap-3 px-6 border-b border-border-light dark:border-border-dark">
          <div class="bg-primary/10 p-2 rounded-lg">
            <span class="text-primary text-xl">🧠</span>
          </div>
          <h1 class="text-lg font-bold tracking-tight">MindSupport</h1>
        </div>
        
        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          <a @click="activeTab = 'stats'" :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors', activeTab === 'stats' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary']">
            <span class="material-symbols-outlined">bar_chart</span>
            <span class="text-sm font-medium">Statistik</span>
          </a>
          <a @click="activeTab = 'users'" :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors', activeTab === 'users' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary']">
            <span class="material-symbols-outlined">group</span>
            <span class="text-sm font-medium">Pengguna</span>
          </a>
          <a @click="activeTab = 'posts'" :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors', activeTab === 'posts' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary']">
            <span class="material-symbols-outlined">forum</span>
            <span class="text-sm font-medium">Postingan</span>
          </a>
          <a @click="activeTab = 'reports'" :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors', activeTab === 'reports' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary']">
            <span class="material-symbols-outlined">warning</span>
            <span class="text-sm font-medium">Laporan</span>
            <span v-if="stats.pendingReports > 0" class="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">{{ stats.pendingReports }}</span>
          </a>
        </nav>
        
        <!-- User Profile -->
        <div class="p-4 border-t border-border-light dark:border-border-dark">
          <router-link to="/dashboard" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              {{ getInitials(currentUser.name) }}
            </div>
            <div class="flex flex-col min-w-0">
              <p class="text-sm font-medium truncate">{{ currentUser.name }}</p>
              <p class="text-xs text-slate-500 truncate">{{ currentUser.email }}</p>
            </div>
          </router-link>
        </div>
      </aside>
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Top Header -->
        <header class="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 md:px-8 sticky top-0 z-10">
          <div class="flex items-center gap-4">
            <button class="md:hidden text-slate-500" @click="mobileMenuOpen = !mobileMenuOpen">
              <span class="material-symbols-outlined">menu</span>
            </button>
            <h2 class="text-lg font-bold">Admin Dashboard</h2>
          </div>
          <div class="flex items-center gap-4">
            <button class="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span class="material-symbols-outlined">notifications</span>
              <span v-if="stats.pendingReports > 0" class="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
            </button>
            <button @click="logout" class="flex items-center gap-2 h-9 px-4 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold transition-colors">
              <span class="material-symbols-outlined text-lg">logout</span>
              <span class="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        
        <!-- Scrollable Content -->
        <main class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 md:p-8">
          <div class="max-w-7xl mx-auto flex flex-col gap-8">
            
            <!-- Stats Section -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Total Users -->
              <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-1">
                <div class="flex justify-between items-start">
                  <p class="text-slate-500 text-sm font-medium">Total Pengguna</p>
                  <span class="material-symbols-outlined text-primary/60">group</span>
                </div>
                <p class="text-2xl font-bold mt-2">{{ stats.totalUsers.toLocaleString() }}</p>
                <p class="text-green-600 text-xs font-medium flex items-center gap-1 mt-1">
                  <span class="material-symbols-outlined text-sm">verified_user</span>
                  Terdaftar
                </p>
              </div>
              
              <!-- Total Posts -->
              <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-1">
                <div class="flex justify-between items-start">
                  <p class="text-slate-500 text-sm font-medium">Total Postingan</p>
                  <span class="material-symbols-outlined text-primary/60">forum</span>
                </div>
                <p class="text-2xl font-bold mt-2">{{ stats.totalPosts.toLocaleString() }}</p>
                <p class="text-green-600 text-xs font-medium flex items-center gap-1 mt-1">
                  <span class="material-symbols-outlined text-sm">trending_up</span>
                  Aktif
                </p>
              </div>
              
              <!-- Pending Reports -->
              <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm flex flex-col gap-1 relative overflow-hidden">
                <div class="absolute right-0 top-0 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-bl-full -mr-8 -mt-8"></div>
                <div class="flex justify-between items-start relative z-10">
                  <p class="text-slate-500 text-sm font-medium">Laporan Pending</p>
                  <span class="material-symbols-outlined text-red-500">warning</span>
                </div>
                <p class="text-2xl font-bold mt-2 relative z-10">{{ stats.pendingReports }}</p>
                <p class="text-red-600 text-xs font-medium flex items-center gap-1 mt-1 relative z-10">
                  <span class="material-symbols-outlined text-sm">priority_high</span>
                  Perlu ditinjau
                </p>
              </div>
              
              <!-- Active Sessions -->
              <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-1">
                <div class="flex justify-between items-start">
                  <p class="text-slate-500 text-sm font-medium">Sesi AI Aktif</p>
                  <span class="material-symbols-outlined text-primary/60">smart_toy</span>
                </div>
                <p class="text-2xl font-bold mt-2">{{ stats.activeSessions.toLocaleString() }}</p>
                <p class="text-green-600 text-xs font-medium flex items-center gap-1 mt-1">
                  <span class="material-symbols-outlined text-sm">psychology</span>
                  Hari ini
                </p>
              </div>
            </div>
            
            <!-- Reports Tab -->
            <div v-if="activeTab === 'stats' || activeTab === 'reports'" class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">🚨 Laporan Baru</h3>
                <button @click="loadReports" class="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Refresh</button>
              </div>
              
              <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark">
                      <tr>
                        <th class="px-6 py-4 font-semibold text-slate-500">Report ID</th>
                        <th class="px-6 py-4 font-semibold text-slate-500">Penulis</th>
                        <th class="px-6 py-4 font-semibold text-slate-500">Alasan</th>
                        <th class="px-6 py-4 font-semibold text-slate-500">Waktu</th>
                        <th class="px-6 py-4 font-semibold text-slate-500 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border-light dark:divide-border-dark">
                      <tr v-for="report in reports" :key="report.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td class="px-6 py-4 font-medium">#{{ report.id.slice(-6) }}</td>
                        <td class="px-6 py-4 text-primary font-medium">{{ report.postAuthor }}</td>
                        <td class="px-6 py-4">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getReasonBadgeClass(report.reason)">
                            {{ report.reason }}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-slate-500">{{ formatTime(report.createdAt) }}</td>
                        <td class="px-6 py-4">
                          <div class="flex items-center justify-end gap-2">
                            <button @click="viewReportedPost(report)" class="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded hover:bg-primary/90 transition-colors">Review</button>
                            <button @click="ignoreReport(report)" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Abaikan</button>
                            <button @click="deleteReportedPost(report)" class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Hapus Post">
                              <span class="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="reports.length === 0">
                        <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                          <span class="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
                          <p class="font-medium">Tidak ada laporan pending</p>
                          <p class="text-sm">Semua laporan sudah ditangani! 🎉</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="reports.length > 0" class="px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                  <span class="text-sm text-slate-500">Menampilkan {{ reports.length }} laporan pending</span>
                </div>
              </div>
            </div>
            
            <!-- Users Tab -->
            <div v-if="activeTab === 'users'" class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">👥 Daftar Pengguna</h3>
                <button @click="loadUsers" class="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Refresh</button>
              </div>
              
              <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark">
                      <tr>
                        <th class="px-6 py-4 font-semibold text-slate-500">Nama</th>
                        <th class="px-6 py-4 font-semibold text-slate-500">Email</th>
                        <th class="px-6 py-4 font-semibold text-slate-500">Terdaftar</th>
                        <th class="px-6 py-4 font-semibold text-slate-500">Status</th>
                        <th class="px-6 py-4 font-semibold text-slate-500 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border-light dark:divide-border-dark">
                      <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td class="px-6 py-4 font-medium">
                          {{ user.name }}
                          <span v-if="user.isAdmin" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">Admin</span>
                        </td>
                        <td class="px-6 py-4 text-slate-500">{{ user.email }}</td>
                        <td class="px-6 py-4 text-slate-500">{{ formatDate(user.createdAt) }}</td>
                        <td class="px-6 py-4">
                          <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', user.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400']">
                            {{ user.active ? 'Aktif' : 'Nonaktif' }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center justify-end gap-2">
                            <button @click="toggleUserStatus(user)" :class="['px-3 py-1.5 text-xs font-medium rounded transition-colors', user.active ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30' : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30']">
                              {{ user.active ? 'Nonaktifkan' : 'Aktifkan' }}
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <!-- Posts Tab -->
            <div v-if="activeTab === 'posts'" class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">📝 Semua Postingan</h3>
                <button @click="loadPosts" class="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Refresh</button>
              </div>
              
              <div class="grid gap-4">
                <div v-for="post in allPosts" :key="post.id" class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">🎭</span>
                      <span class="font-medium text-primary">{{ post.anonymousId }}</span>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{{ post.mood }}</span>
                    </div>
                    <button @click="deletePost(post)" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus Post">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                  <p class="text-slate-700 dark:text-slate-300 mb-3">{{ post.content }}</p>
                  <div class="flex items-center gap-4 text-sm text-slate-500">
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-base">chat_bubble</span>
                      {{ post.commentCount }} komentar
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-base">schedule</span>
                      {{ formatTime(post.createdAt) }}
                    </span>
                  </div>
                </div>
                
                <div v-if="allPosts.length === 0" class="bg-surface-light dark:bg-surface-dark p-12 rounded-xl border border-border-light dark:border-border-dark text-center">
                  <span class="text-4xl mb-4 block">📭</span>
                  <p class="font-medium text-slate-600 dark:text-slate-400">Belum ada postingan</p>
                </div>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  `,
  data() {
    return {
      activeTab: 'stats',
      loading: false,
      mobileMenuOpen: false,
      currentUser: {
        name: '',
        email: ''
      },
      stats: {
        totalUsers: 0,
        totalPosts: 0,
        pendingReports: 0,
        activeSessions: 0
      },
      reports: [],
      users: [],
      allPosts: []
    }
  },
  async created() {
    this.loadCurrentUser();
    await this.loadData();
  },
  methods: {
    loadCurrentUser() {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        this.currentUser = {
          name: user.full_name || user.name || 'Admin',
          email: user.email || ''
        };
      }
    },

    getInitials(name) {
      if (!name) return 'A';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    async loadData() {
      this.loading = true;
      try {
        const stats = await api.getAdminStats();
        this.stats = {
          totalUsers: stats.total_users,
          totalPosts: stats.total_posts,
          pendingReports: stats.pending_reports,
          activeSessions: stats.active_sessions
        };

        await this.loadReports();
        await this.loadUsers();
        await this.loadPosts();
      } catch (error) {
        console.error('Failed to load admin data:', error);
        if (error.message.includes('403') || error.message.includes('Akses ditolak')) {
          alert('Akses ditolak. Anda bukan admin.');
          this.$router.push('/dashboard');
        }
      } finally {
        this.loading = false;
      }
    },

    async loadReports() {
      try {
        const response = await api.getAdminReports('pending');
        this.reports = response.reports.map(r => ({
          id: r.id,
          postId: r.post_id,
          postAuthor: r.post_author,
          postContent: r.post_content,
          reason: r.reason,
          note: r.note,
          createdAt: new Date(r.created_at)
        }));
      } catch (error) {
        console.error('Failed to load reports:', error);
      }
    },

    async loadUsers() {
      try {
        const response = await api.getAdminUsers();
        this.users = response.users.map(u => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          createdAt: new Date(u.created_at),
          active: u.is_active,
          isAdmin: u.is_superuser
        }));
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    },

    async loadPosts() {
      try {
        const response = await api.getAdminPosts();
        this.allPosts = response.posts.map(p => ({
          id: p.id,
          anonymousId: p.anonymous_id,
          mood: p.mood,
          content: p.content,
          commentCount: p.comment_count,
          createdAt: new Date(p.created_at)
        }));
      } catch (error) {
        console.error('Failed to load posts:', error);
      }
    },

    getReasonBadgeClass(reason) {
      const lowerReason = reason.toLowerCase();
      if (lowerReason.includes('kebencian') || lowerReason.includes('sara')) {
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-900/50';
      }
      if (lowerReason.includes('bullying') || lowerReason.includes('perundungan')) {
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50';
      }
      if (lowerReason.includes('spam') || lowerReason.includes('promosi')) {
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
      }
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-900/50';
    },

    formatTime(date) {
      if (!date) return '';
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return days + ' hari lalu';
      if (hours > 0) return hours + ' jam lalu';
      if (minutes > 0) return minutes + ' menit lalu';
      return 'Baru saja';
    },

    formatDate(date) {
      if (!date) return '';
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    viewReportedPost(report) {
      alert('📋 Konten yang dilaporkan:\n\n' + report.postContent + '\n\n📝 Catatan: ' + (report.note || 'Tidak ada'));
    },

    async ignoreReport(report) {
      if (confirm('Abaikan laporan ini?')) {
        try {
          await api.handleReport(report.id, 'dismiss', false);
          this.reports = this.reports.filter(r => r.id !== report.id);
          this.stats.pendingReports--;
          alert('✅ Laporan diabaikan');
        } catch (error) {
          alert('❌ Gagal: ' + error.message);
        }
      }
    },

    async deleteReportedPost(report) {
      if (confirm('⚠️ Hapus postingan ini?\n\nTindakan tidak dapat dibatalkan!')) {
        try {
          await api.handleReport(report.id, 'resolve', true);
          this.reports = this.reports.filter(r => r.id !== report.id);
          this.stats.pendingReports--;
          alert('✅ Postingan berhasil dihapus');
        } catch (error) {
          alert('❌ Gagal: ' + error.message);
        }
      }
    },

    async toggleUserStatus(user) {
      try {
        const result = await api.toggleUserStatus(user.id);
        user.active = result.is_active;
        alert(user.active ? '✅ Pengguna diaktifkan' : '🚫 Pengguna dinonaktifkan');
      } catch (error) {
        alert('❌ Gagal: ' + error.message);
      }
    },

    async deletePost(post) {
      if (confirm('Hapus postingan ini?')) {
        try {
          await api.adminDeletePost(post.id);
          this.allPosts = this.allPosts.filter(p => p.id !== post.id);
          this.stats.totalPosts--;
          alert('✅ Postingan dihapus');
        } catch (error) {
          alert('❌ Gagal: ' + error.message);
        }
      }
    },

    logout() {
      api.logout();
      this.$router.push('/login');
    }
  }
};
