// Chat Page Component - AI Counseling Interface
const Chat = {
  template: `
    <div class="app-layout">
      <sidebar-component :active-menu="'chat'"></sidebar-component>
      
      <div class="main-content">
        <header-component :title="'Chat Konseling AI'" :show-back="true">
          <template #actions>
            <button class="btn btn-outline btn-sm" @click="showEmergencyModal = true">
              📞 Butuh Bantuan Darurat
            </button>
          </template>
        </header-component>
        
        <div class="chat-container">
          <!-- Chat Messages -->
          <div class="chat-messages" ref="chatMessages">
            <div v-for="(message, index) in messages" :key="index" 
                 :class="['message', message.sender === 'ai' ? 'message-ai' : 'message-user']">
              <div v-if="message.sender === 'ai'" class="avatar">🤖</div>
              <div class="message-content" v-html="formatMessage(message.content)"></div>
            </div>
            
            <!-- Typing Indicator -->
            <div v-if="isTyping" class="message message-ai">
              <div class="avatar">🤖</div>
              <div class="message-content typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
          
          <!-- Input Area -->
          <div class="chat-input-area">
            <input 
              type="text" 
              v-model="newMessage" 
              @keyup.enter="sendMessage"
              placeholder="Ketik pesanmu di sini..."
              :disabled="isTyping"
            >
            <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim() || isTyping">
              🤖
            </button>
          </div>
        </div>
      </div>
      
      <!-- Emergency Modal -->
      <modal-component 
        :show="showEmergencyModal" 
        title="🚨 Bantuan Darurat"
        @close="showEmergencyModal = false"
      >
        <div class="emergency-content">
          <p style="margin-bottom: 16px;">Jika kamu sedang dalam kondisi darurat atau memiliki pikiran untuk menyakiti diri sendiri, silakan hubungi:</p>
          
          <div class="emergency-contacts">
            <div class="emergency-item">
              <strong>📞 Into The Light Indonesia</strong>
              <p>119 ext. 8</p>
            </div>
            <div class="emergency-item">
              <strong>📞 Yayasan Pulih</strong>
              <p>(021) 788-42580</p>
            </div>
            <div class="emergency-item">
              <strong>📞 LSM Jangan Bunuh Diri</strong>
              <p>(021) 9696-9293</p>
            </div>
            <div class="emergency-item">
              <strong>🏥 Unit Konseling Kampus</strong>
              <p>Kunjungi langsung saat jam kerja</p>
            </div>
          </div>
          
          <p style="margin-top: 16px; color: var(--neutral-500); font-size: 14px;">
            💜 Kamu tidak sendirian. Ada orang yang peduli dan siap membantu.
          </p>
        </div>
      </modal-component>
    </div>
  `,
  data() {
    return {
      messages: [
        {
          sender: 'ai',
          content: 'Hai! 👋 Aku MindSupport AI, temanmu untuk berbagi cerita.\n\nAku di sini untuk mendengarkan apapun yang kamu rasakan hari ini. Ceritakan saja, aku tidak akan menghakimi.\n\nApa yang sedang kamu rasakan sekarang? 💜'
        }
      ],
      newMessage: '',
      isTyping: false,
      showEmergencyModal: false,
      sessionId: null
    }
  },
  created() {
    this.sessionId = null; // Will be set by API
  },
  methods: {
    formatMessage(content) {
      // Convert line breaks to <br> and basic formatting
      return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    },

    async sendMessage() {
      if (!this.newMessage.trim() || this.isTyping) return;

      const userMessage = this.newMessage.trim();
      this.messages.push({
        sender: 'user',
        content: userMessage
      });
      this.newMessage = '';

      this.scrollToBottom();
      this.isTyping = true;

      try {
        // Call real backend API
        const response = await api.sendMessage(userMessage, this.sessionId);

        // Store session ID for context continuity
        this.sessionId = response.session_id;

        this.messages.push({
          sender: 'ai',
          content: response.content
        });
      } catch (error) {
        this.messages.push({
          sender: 'ai',
          content: 'Maaf, terjadi kesalahan. Coba lagi ya. 💜'
        });
      } finally {
        this.isTyping = false;
        this.scrollToBottom();
      }
    },

    generateResponse(userMessage) {
      // Demo responses - in real app, this would call OpenAI API via backend
      const lowerMsg = userMessage.toLowerCase();

      if (lowerMsg.includes('cemas') || lowerMsg.includes('khawatir') || lowerMsg.includes('takut')) {
        return 'Aku mengerti perasaan cemasmu. Rasa cemas adalah respons alami tubuh, dan kamu tidak salah merasakannya. 💜\n\nMari kita coba teknik pernapasan sederhana:\n\n🌬️ **Tarik napas dalam** selama 4 detik\n⏸️ **Tahan** selama 4 detik\n💨 **Hembuskan** selama 4 detik\n\nUlangi 3-5 kali. Bagaimana perasaanmu setelah mencoba?';
      }

      if (lowerMsg.includes('sedih') || lowerMsg.includes('menangis') || lowerMsg.includes('down')) {
        return 'Terima kasih sudah berbagi perasaanmu. Menangis itu tidak apa-apa, itu cara tubuh melepaskan emosi. 💜\n\nKamu tidak harus kuat setiap saat. Kadang, mengakui bahwa kita sedih adalah langkah pertama untuk merasa lebih baik.\n\nMaukah kamu ceritakan apa yang membuatmu merasa seperti ini?';
      }

      if (lowerMsg.includes('stress') || lowerMsg.includes('tugas') || lowerMsg.includes('kuliah') || lowerMsg.includes('skripsi')) {
        return 'Tekanan akademik memang bisa sangat overwhelming. Kamu tidak sendirian merasakannya. 💜\n\nCoba kita uraikan bebanmu:\n\n1. **Identifikasi** - Apa tugas yang paling mendesak?\n2. **Prioritaskan** - Mana yang bisa dikerjakan hari ini?\n3. **Mulai kecil** - Kerjakan dalam potongan 25 menit (Pomodoro)\n\nIngat, progress kecil tetap progress. Apa yang paling membuatmu khawatir sekarang?';
      }

      if (lowerMsg.includes('bunuh') || lowerMsg.includes('mati') || lowerMsg.includes('menyakiti')) {
        return '💜 Aku sangat peduli dengan keselamatanmu.\n\nJika kamu memiliki pikiran untuk menyakiti diri sendiri, tolong hubungi bantuan profesional sekarang:\n\n📞 **Into The Light Indonesia**: 119 ext. 8\n📞 **Yayasan Pulih**: (021) 788-42580\n\nKamu tidak harus menghadapi ini sendirian. Ada orang yang peduli dan siap membantu 24/7.\n\nApakah ada orang terdekat yang bisa kamu hubungi sekarang?';
      }

      if (lowerMsg.includes('terima kasih') || lowerMsg.includes('makasih')) {
        return 'Sama-sama! 💜 Aku senang bisa menemanimu.\n\nIngat, kamu selalu bisa kembali ke sini kapanpun kamu butuh teman untuk berbagi. Jaga dirimu ya!';
      }

      // Default empathetic response
      return 'Terima kasih sudah berbagi itu denganku. Aku mendengarkanmu. 💜\n\nPerasaanmu valid dan penting. Tidak ada yang salah dengan apa yang kamu rasakan.\n\nCeritakan lebih lanjut, aku di sini untukmu.';
    },

    async sendQuickAction(type) {
      const actions = {
        breathing: 'Aku ingin mencoba teknik pernapasan',
        grounding: 'Aku ingin mencoba teknik grounding 5-4-3-2-1',
        mindfulness: 'Aku ingin mencoba latihan mindfulness',
        affirmation: 'Aku butuh afirmasi positif'
      };

      this.messages.push({
        sender: 'user',
        content: actions[type]
      });

      this.isTyping = true;
      this.scrollToBottom();

      try {
        // Call real backend API
        const response = await api.sendMessage(actions[type], this.sessionId);
        this.sessionId = response.session_id;

        this.messages.push({
          sender: 'ai',
          content: response.content
        });
      } catch (error) {
        this.messages.push({
          sender: 'ai',
          content: 'Maaf, terjadi kesalahan. Coba lagi ya. 💜'
        });
      } finally {
        this.isTyping = false;
        this.scrollToBottom();
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatMessages;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }
};
