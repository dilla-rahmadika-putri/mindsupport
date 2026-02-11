// Forum Page Component - Anonymous Discussion
const Forum = {
  template: `
    <div class="app-layout">
      <sidebar-component :active-menu="'forum'"></sidebar-component>
      
      <div class="main-content">
        <header-component :title="'Forum Berbagi'">
          <template #actions>
            <button class="btn btn-primary" @click="showCreateModal = true">
              ➕ Buat Postingan
            </button>
          </template>
        </header-component>
        
        <div class="page-content">
          <!-- Filters -->
          <div class="forum-filters">
            <button 
              v-for="filter in filters" 
              :key="filter.value"
              :class="['filter-chip', { active: activeFilter === filter.value }]"
              @click="activeFilter = filter.value"
            >
              {{ filter.icon }} {{ filter.label }}
            </button>
          </div>
          
          <!-- Posts List -->
          <div class="posts-list">
            <div v-for="post in filteredPosts" :key="post.id" class="post-card animate-fade-in">
              <div class="post-header">
                <div class="post-author">
                  <span class="mask-icon">🎭</span>
                  <span class="post-author-name">{{ post.anonymousId }}</span>
                </div>
                <span :class="['badge', getMoodBadgeClass(post.mood)]">
                  {{ getMoodIcon(post.mood) }} {{ post.mood }}
                </span>
              </div>
              
              <div class="post-content">
                {{ post.content }}
              </div>
              
              <div class="post-footer">
                <div class="post-stats">
                  <span class="post-stat" @click="toggleSupport(post)">
                    {{ post.supported ? '❤️' : '🤍' }} {{ post.supportCount }} support
                  </span>
                  <span class="post-stat" @click="viewPost(post)">
                    💬 {{ post.comments.length }} komentar
                  </span>
                  <span class="post-stat">
                    🕐 {{ formatTime(post.createdAt) }}
                  </span>
                </div>
                <button class="btn btn-ghost btn-sm" @click="reportPost(post)">
                  🚨 Report
                </button>
              </div>
              
              <!-- Comments Preview -->
              <div v-if="post.comments.length > 0" class="comments-preview">
                <div v-for="comment in post.comments.slice(0, 2)" :key="comment.id" class="comment-item">
                  <span class="comment-author">{{ comment.anonymousId }}</span>
                  <span class="comment-text">{{ comment.content }}</span>
                </div>
                <a v-if="post.comments.length > 2" href="#" @click.prevent="viewPost(post)" class="view-more">
                  Lihat {{ post.comments.length - 2 }} komentar lainnya...
                </a>
              </div>
              
              <!-- Add Comment -->
              <div class="add-comment">
                <input 
                  type="text" 
                  v-model="post.newComment"
                  placeholder="Tulis komentar supportif..."
                  @keyup.enter="addComment(post)"
                >
                <button class="btn btn-primary btn-sm" @click="addComment(post)" :disabled="!post.newComment">
                  Kirim
                </button>
              </div>
            </div>
            
            <div v-if="filteredPosts.length === 0" class="empty-state">
              <span class="empty-icon">📭</span>
              <h3>Belum ada postingan</h3>
              <p>Jadilah yang pertama berbagi cerita!</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Create Post Modal -->
      <modal-component 
        :show="showCreateModal" 
        title="➕ Buat Postingan Baru"
        @close="showCreateModal = false"
      >
        <div class="create-post-form">
          <div class="anonymous-notice">
            <span class="mask-icon">🎭</span>
            <span>Identitas: <strong>{{ userAnonymousId }}</strong></span>
          </div>
          
          <div class="form-group">
            <label class="form-label">Kategori Mood</label>
            <div class="mood-tags">
              <button 
                v-for="mood in moods" 
                :key="mood.value"
                :class="['mood-tag', { selected: newPost.mood === mood.value }]"
                @click="newPost.mood = mood.value"
              >
                {{ mood.icon }} {{ mood.label }}
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Ceritakan yang ingin kamu bagikan</label>
            <textarea 
              class="form-input form-textarea"
              v-model="newPost.content"
              placeholder="Tulis ceritamu di sini... Tidak perlu khawatir, identitasmu akan tetap anonim."
              rows="5"
            ></textarea>
          </div>
          
          <div class="privacy-notice" style="margin-bottom: 16px;">
            <span>⚠️</span>
            <p>Ceritamu akan diposting secara anonim. Identitas aslimu tidak akan terlihat oleh siapapun.</p>
          </div>
          
          <button 
            class="btn btn-primary btn-lg" 
            style="width: 100%;"
            @click="createPost"
            :disabled="!newPost.content || !newPost.mood"
          >
            📤 Posting
          </button>
        </div>
      </modal-component>
      
      <!-- Report Modal -->
      <modal-component 
        :show="showReportModal" 
        title="🚨 Laporkan Postingan"
        @close="showReportModal = false"
      >
        <div class="report-form">
          <div class="form-group">
            <label class="form-label">Alasan Pelaporan</label>
            <div class="report-reasons">
              <label v-for="reason in reportReasons" :key="reason" class="radio-label">
                <input type="radio" v-model="reportReason" :value="reason">
                <span>{{ reason }}</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Keterangan Tambahan (opsional)</label>
            <textarea 
              class="form-input form-textarea"
              v-model="reportNote"
              placeholder="Jelaskan lebih detail jika perlu..."
              rows="3"
            ></textarea>
          </div>
          
          <button 
            class="btn btn-danger btn-lg" 
            style="width: 100%;"
            @click="submitReport"
            :disabled="!reportReason"
          >
            Kirim Laporan
          </button>
        </div>
      </modal-component>
    </div>
  `,
  data() {
    return {
      activeFilter: 'all',
      filters: [
        { value: 'all', label: 'Semua', icon: '📋' },
        { value: 'Sedih', label: 'Sedih', icon: '😢' },
        { value: 'Butuh Saran', label: 'Butuh Saran', icon: '🤔' },
        { value: 'Curhat', label: 'Curhat', icon: '💭' },
        { value: 'Sukses', label: 'Sukses', icon: '🎉' }
      ],
      moods: [
        { value: 'Sedih', label: 'Sedih', icon: '😢' },
        { value: 'Butuh Saran', label: 'Butuh Saran', icon: '🤔' },
        { value: 'Curhat', label: 'Curhat', icon: '💭' },
        { value: 'Kesal', label: 'Kesal', icon: '😤' },
        { value: 'Sukses', label: 'Sukses', icon: '🎉' }
      ],
      posts: [],
      loading: false,
      showCreateModal: false,
      showReportModal: false,
      newPost: {
        mood: '',
        content: ''
      },
      reportingPost: null,
      reportReason: '',
      reportNote: '',
      reportReasons: [
        'Mengandung ujaran kebencian/SARA',
        'Perundungan/bullying',
        'Konten tidak pantas',
        'Spam atau promosi',
        'Mengandung data pribadi',
        'Lainnya'
      ],
      userAnonymousId: 'Loading...'
    }
  },
  async created() {
    await this.loadPosts();
    this.loadUserProfile();
  },
  computed: {
    filteredPosts() {
      if (this.activeFilter === 'all') {
        return this.posts;
      }
      return this.posts.filter(post => post.mood === this.activeFilter);
    }
  },
  methods: {
    getMoodBadgeClass(mood) {
      const classes = {
        'Sedih': 'badge-primary',
        'Butuh Saran': 'badge-warning',
        'Curhat': 'badge-neutral',
        'Kesal': 'badge-danger',
        'Sukses': 'badge-success'
      };
      return classes[mood] || 'badge-neutral';
    },

    getMoodIcon(mood) {
      const icons = {
        'Sedih': '😢',
        'Butuh Saran': '🤔',
        'Curhat': '💭',
        'Kesal': '😤',
        'Sukses': '🎉'
      };
      return icons[mood] || '💭';
    },

    formatTime(date) {
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) return days + ' hari lalu';
      if (hours > 0) return hours + ' jam lalu';
      return 'Baru saja';
    },

    async loadPosts() {
      this.loading = true;
      try {
        const moodFilter = this.activeFilter === 'all' ? null : this.activeFilter;
        const response = await api.getPosts(1, 50, moodFilter);
        this.posts = response.posts.map(post => ({
          id: post.id,
          anonymousId: post.anonymous_id,
          mood: post.mood,
          content: post.content,
          supportCount: post.like_count,
          supported: post.is_liked,
          createdAt: new Date(post.created_at),
          comments: post.comments.map(c => ({
            id: c.comment_id,
            anonymousId: c.anonymous_id,
            content: c.content
          })),
          newComment: ''
        }));
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadUserProfile() {
      try {
        const user = await api.getProfile();
        this.userAnonymousId = user.anonymous_id;
      } catch (error) {
        const stored = localStorage.getItem('user');
        if (stored) {
          this.userAnonymousId = JSON.parse(stored).anonymous_id || 'Anonim#???';
        }
      }
    },

    async toggleSupport(post) {
      try {
        const result = await api.toggleLike(post.id);
        post.supported = result.liked;
        post.supportCount = result.like_count;
      } catch (error) {
        console.error('Failed to toggle like:', error);
      }
    },

    viewPost(post) {
      console.log('View post:', post.id);
    },

    async addComment(post) {
      if (!post.newComment.trim()) return;

      try {
        const result = await api.addComment(post.id, post.newComment);
        post.comments.push({
          id: result.comment_id,
          anonymousId: result.anonymous_id,
          content: result.content
        });
        post.newComment = '';
      } catch (error) {
        console.error('Failed to add comment:', error);
        alert('Gagal menambahkan komentar. Silakan coba lagi.');
      }
    },

    async createPost() {
      if (!this.newPost.content || !this.newPost.mood) return;

      try {
        const result = await api.createPost(this.newPost.mood, this.newPost.content);
        this.posts.unshift({
          id: result.id,
          anonymousId: result.anonymous_id,
          mood: result.mood,
          content: result.content,
          supportCount: 0,
          supported: false,
          createdAt: new Date(result.created_at),
          comments: [],
          newComment: ''
        });
        this.newPost = { mood: '', content: '' };
        this.showCreateModal = false;
      } catch (error) {
        console.error('Failed to create post:', error);
        alert('Gagal membuat postingan. Silakan coba lagi.');
      }
    },

    reportPost(post) {
      this.reportingPost = post;
      this.reportReason = '';
      this.reportNote = '';
      this.showReportModal = true;
    },

    async submitReport() {
      if (!this.reportReason) return;

      try {
        await api.reportPost(this.reportingPost.id, this.reportReason, this.reportNote);
        alert('Laporan berhasil dikirim. Tim kami akan meninjau laporan ini.');
        this.showReportModal = false;
      } catch (error) {
        console.error('Failed to submit report:', error);
        alert(error.message || 'Gagal mengirim laporan.');
      }
    }
  },
  watch: {
    activeFilter() {
      this.loadPosts();
    }
  }
};
