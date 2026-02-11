// Dashboard Page Component
const Dashboard = {
    template: `
    <div class="app-layout">
      <sidebar-component :active-menu="'dashboard'"></sidebar-component>
      
      <div class="main-content">
        <header-component :title="'Dashboard'"></header-component>
        
        <div class="page-content">
          <!-- Welcome Section -->
          <div class="welcome-section animate-slide-up">
            <h1>Selamat Datang, {{ user?.name || 'Mahasiswa' }}! 👋</h1>
            <p>Apa yang ingin kamu lakukan hari ini?</p>
          </div>
          
          <!-- Feature Cards -->
          <div class="feature-grid">
            <div class="card card-feature" @click="$router.push('/chat')">
              <div class="icon">🤖</div>
              <h3>Chat Konseling AI</h3>
              <p>Ngobrol dengan AI yang memahami perasaanmu. Dapatkan dukungan emosional kapan saja.</p>
              <button class="btn btn-primary">Mulai Chat</button>
            </div>
            
            <div class="card card-feature" @click="$router.push('/forum')">
              <div class="icon">💬</div>
              <h3>Forum Berbagi</h3>
              <p>Berbagi cerita secara anonim dengan teman sebaya. Kamu tidak sendirian.</p>
              <button class="btn btn-primary">Buka Forum</button>
            </div>
          </div>
          
          <!-- Journal Section -->
          <div class="card journal-preview animate-fade-in" style="margin-top: 24px;">
            <div class="journal-header">
              <div>
                <h3>📔 Riwayat Journal</h3>
                <p>Lihat kembali percakapanmu dan refleksikan perjalanan emosionalmu</p>
              </div>
              <button class="btn btn-outline" @click="$router.push('/journal')">Buka Riwayat</button>
            </div>
            
            <div class="journal-stats">
              <div class="stat-item">
                <span class="stat-number">{{ stats.totalSessions }}</span>
                <span class="stat-label">Total Sesi</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ stats.thisMonth }}</span>
                <span class="stat-label">Bulan Ini</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ stats.forumPosts }}</span>
                <span class="stat-label">Postingan Forum</span>
              </div>
            </div>
          </div>
          
          <!-- Quick Tips -->
          <div class="tips-section animate-fade-in" style="margin-top: 24px;">
            <h3>💡 Tips Hari Ini</h3>
            <div class="tips-grid">
              <div class="tip-card">
                <span class="tip-icon">🌬️</span>
                <h4>Teknik Pernapasan</h4>
                <p>Tarik napas 4 detik, tahan 4 detik, hembuskan 4 detik. Ulangi 3x.</p>
              </div>
              <div class="tip-card">
                <span class="tip-icon">🧘</span>
                <h4>Grounding 5-4-3-2-1</h4>
                <p>Sebutkan 5 hal yang kamu lihat, 4 yang kamu dengar, 3 yang kamu rasakan...</p>
              </div>
              <div class="tip-card">
                <span class="tip-icon">📝</span>
                <h4>Journaling</h4>
                <p>Tuliskan 3 hal yang kamu syukuri hari ini sebelum tidur.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    data() {
        return {
            user: null,
            stats: {
                totalSessions: 15,
                thisMonth: 4,
                forumPosts: 3
            }
        }
    },
    created() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.user = JSON.parse(userData);
        }
    }
};
