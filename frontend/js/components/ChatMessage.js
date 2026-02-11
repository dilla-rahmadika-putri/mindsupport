// Chat Message Component
const ChatMessage = {
    template: `
    <div :class="['message', isAi ? 'message-ai' : 'message-user']">
      <div v-if="isAi" class="avatar">🤖</div>
      <div class="message-content">
        <div v-html="formattedContent"></div>
        <span class="message-time">{{ formattedTime }}</span>
      </div>
    </div>
  `,
    props: {
        content: {
            type: String,
            required: true
        },
        sender: {
            type: String,
            default: 'user'
        },
        timestamp: {
            type: Date,
            default: () => new Date()
        }
    },
    computed: {
        isAi() {
            return this.sender === 'ai';
        },
        formattedContent() {
            return this.content
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        },
        formattedTime() {
            return this.timestamp.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
};
