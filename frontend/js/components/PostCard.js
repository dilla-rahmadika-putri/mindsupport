// Post Card Component
const PostCard = {
    template: `
    <div class="post-card">
      <div class="post-header">
        <div class="post-author">
          <span class="mask-icon">🎭</span>
          <span class="post-author-name">{{ post.anonymousId }}</span>
        </div>
        <span :class="['badge', moodBadgeClass]">
          {{ moodIcon }} {{ post.mood }}
        </span>
      </div>
      
      <div class="post-content">
        {{ post.content }}
      </div>
      
      <div class="post-footer">
        <div class="post-stats">
          <span class="post-stat" @click="$emit('support', post)">
            {{ post.supported ? '❤️' : '🤍' }} {{ post.supportCount }} support
          </span>
          <span class="post-stat" @click="$emit('view', post)">
            💬 {{ post.comments?.length || 0 }} komentar
          </span>
          <span class="post-stat">
            🕐 {{ formattedTime }}
          </span>
        </div>
        <button class="btn btn-ghost btn-sm" @click="$emit('report', post)">
          🚨 Report
        </button>
      </div>
    </div>
  `,
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    computed: {
        moodBadgeClass() {
            const classes = {
                'Sedih': 'badge-primary',
                'Butuh Saran': 'badge-warning',
                'Curhat': 'badge-neutral',
                'Kesal': 'badge-danger',
                'Sukses': 'badge-success'
            };
            return classes[this.post.mood] || 'badge-neutral';
        },
        moodIcon() {
            const icons = {
                'Sedih': '😢',
                'Butuh Saran': '🤔',
                'Curhat': '💭',
                'Kesal': '😤',
                'Sukses': '🎉'
            };
            return icons[this.post.mood] || '💭';
        },
        formattedTime() {
            const now = new Date();
            const postDate = new Date(this.post.createdAt);
            const diff = now - postDate;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);

            if (days > 0) return days + ' hari lalu';
            if (hours > 0) return hours + ' jam lalu';
            return 'Baru saja';
        }
    }
};
