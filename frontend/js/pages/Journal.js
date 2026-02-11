// Journal Page Component - Chat History
const Journal = {
  template: `
    <div class="app-layout">
      <sidebar-component :active-menu="'journal'"></sidebar-component>
      
      <div class="main-content">
        <header-component :title="'Riwayat Journal'"></header-component>
        
        <div class="page-content">
          <!-- Stats Overview -->
          <div class="card journal-stats-card animate-slide-up">
            <h3>📊 Perjalanan Emosionalmu</h3>
            <div class="journal-stats-grid">
              <div class="journal-stat">
                <span class="stat-value">{{ stats.totalSessions }}</span>
                <span class="stat-label">Total Sesi</span>
              </div>
              <div class="journal-stat">
                <span class="stat-value">{{ stats.thisMonth }}</span>
                <span class="stat-label">Bulan Ini</span>
              </div>
              <div class="journal-stat">
                <span class="stat-value">{{ stats.totalMessages }}</span>
                <span class="stat-label">Total Pesan</span>
              </div>
              <div class="journal-stat">
                <span class="stat-value">{{ stats.avgDuration }}</span>
                <span class="stat-label">Rata-rata Durasi</span>
              </div>
            </div>
          </div>
          
          <!-- Sessions List -->
          <div class="sessions-section">
            <h3 style="margin-bottom: 16px;">📅 Riwayat Sesi</h3>
            
            <div v-for="session in sessions" :key="session.id" class="session-card animate-fade-in">
              <div class="session-info">
                <div class="session-date">
                  <span class="day">{{ formatDay(session.date) }}</span>
                  <span class="month">{{ formatMonth(session.date) }}</span>
                </div>
                <div class="session-details">
                  <h4>{{ session.topic }}</h4>
                  <div class="session-meta">
                    <span>🕐 {{ session.duration }} menit</span>
                    <span>💬 {{ session.messageCount }} pesan</span>
                  </div>
                </div>
              </div>
              <button class="btn btn-outline" @click="viewSession(session)">
                👁️ Lihat Sesi
              </button>
            </div>
            
            <div v-if="sessions.length === 0" class="empty-state">
              <span class="empty-icon">📭</span>
              <h3>Belum ada riwayat sesi</h3>
              <p>Mulai chat dengan AI untuk membuat riwayat pertamamu!</p>
              <button class="btn btn-primary" @click="$router.push('/chat')">
                🤖 Mulai Chat
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Session Detail Modal -->
      <modal-component 
        :show="showSessionModal" 
        :title="'📔 ' + (selectedSession?.topic || 'Detail Sesi')"
        @close="showSessionModal = false"
        size="large"
      >
        <div v-if="selectedSession" class="session-detail">
          <div class="session-detail-header">
            <span>📅 {{ formatFullDate(selectedSession.date) }}</span>
            <span>🕐 {{ selectedSession.duration }} menit</span>
          </div>
          
          <div class="session-messages">
            <div v-for="(message, index) in selectedSession.messages" :key="index"
                 :class="['message', message.sender === 'ai' ? 'message-ai' : 'message-user']">
              <div v-if="message.sender === 'ai'" class="avatar">🤖</div>
              <div class="message-content">{{ message.content }}</div>
            </div>
          </div>
        </div>
      </modal-component>
    </div>
  `,
  data() {
    return {
      stats: {
        totalSessions: 0,
        thisMonth: 0,
        totalMessages: 0,
        avgDuration: '0 min'
      },
      sessions: [],
      loading: false,
      showSessionModal: false,
      selectedSession: null
    }
  },
  async created() {
    await this.loadHistory();
  },
  methods: {
    formatDay(date) {
      return date.getDate();
    },

    formatMonth(date) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      return months[date.getMonth()];
    },

    formatFullDate(date) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('id-ID', options);
    },

    async loadHistory() {
      this.loading = true;
      try {
        const history = await api.getChatHistory();
        this.sessions = history.map(session => ({
          id: session.session_id,
          date: new Date(session.created_at),
          topic: session.title,
          duration: Math.floor(session.message_count * 0.8), // Estimate
          messageCount: session.message_count,
          messages: [] // Will be loaded on demand
        }));

        // Calculate stats
        const now = new Date();
        const thisMonth = this.sessions.filter(s =>
          s.date.getMonth() === now.getMonth() && s.date.getFullYear() === now.getFullYear()
        ).length;
        const totalMessages = this.sessions.reduce((sum, s) => sum + s.messageCount, 0);
        const avgDuration = this.sessions.length > 0
          ? Math.round(this.sessions.reduce((sum, s) => sum + s.duration, 0) / this.sessions.length)
          : 0;

        this.stats = {
          totalSessions: this.sessions.length,
          thisMonth: thisMonth,
          totalMessages: totalMessages,
          avgDuration: avgDuration + ' min'
        };
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        this.loading = false;
      }
    },

    async viewSession(session) {
      try {
        // Load full session if messages not loaded yet
        if (session.messages.length === 0) {
          const detail = await api.getChatSession(session.id);
          session.messages = detail.messages.map(m => ({
            sender: m.role === 'user' ? 'user' : 'ai',
            content: m.content
          }));
        }
        this.selectedSession = session;
        this.showSessionModal = true;
      } catch (error) {
        console.error('Failed to load session:', error);
        alert('Gagal memuat sesi. Silakan coba lagi.');
      }
    }
  }
};
