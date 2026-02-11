// Profile Page Component
const Profile = {
  template: `
    <div class="app-layout">
      <sidebar-component :active-menu="'profile'"></sidebar-component>
      
      <div class="main-content">
        <header-component :title="'Profil Pengguna'"></header-component>
        
        <div class="page-content">
          <div class="profile-container">
            <!-- Profile Card -->
            <div class="card profile-card animate-slide-up">
              <div class="profile-header">
                <div class="avatar avatar-lg">
                  {{ getInitials(user.name) }}
                </div>
                <div class="profile-info">
                  <h2>{{ user.name }}</h2>
                  <p class="profile-email">{{ user.email }}</p>
                  <span class="badge badge-primary">🎭 {{ user.anonymousId }}</span>
                </div>
              </div>
            </div>
            
            <!-- Edit Profile Form -->
            <div class="card animate-fade-in" style="margin-top: 24px;">
              <h3 style="margin-bottom: 24px;">✏️ Edit Profil</h3>
              
              <form @submit.prevent="updateProfile">
                <div class="form-group">
                  <label class="form-label">Nama Lengkap</label>
                  <input type="text" class="form-input" v-model="editForm.name">
                </div>
                
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-input" v-model="editForm.email" disabled>
                  <small style="color: var(--neutral-500);">Email tidak dapat diubah</small>
                </div>
                
                <div class="form-group">
                  <label class="form-label">NIM</label>
                  <input type="text" class="form-input" v-model="editForm.nim" disabled>
                </div>
                
                <button type="submit" class="btn btn-primary">
                  💾 Simpan Perubahan
                </button>
              </form>
            </div>
            
            <!-- Change Password -->
            <div class="card animate-fade-in" style="margin-top: 24px;">
              <h3 style="margin-bottom: 24px;">🔒 Ubah Password</h3>
              
              <form @submit.prevent="changePassword">
                <div class="form-group">
                  <label class="form-label">Password Lama</label>
                  <input type="password" class="form-input" v-model="passwordForm.oldPassword">
                </div>
                
                <div class="form-group">
                  <label class="form-label">Password Baru</label>
                  <input type="password" class="form-input" v-model="passwordForm.newPassword">
                </div>
                
                <div class="form-group">
                  <label class="form-label">Konfirmasi Password Baru</label>
                  <input type="password" class="form-input" v-model="passwordForm.confirmPassword">
                </div>
                
                <button type="submit" class="btn btn-outline">
                  🔐 Ubah Password
                </button>
              </form>
            </div>
            
            <!-- Privacy Settings -->
            <div class="card animate-fade-in" style="margin-top: 24px;">
              <h3 style="margin-bottom: 24px;">🔐 Pengaturan Privasi</h3>
              
              <div class="privacy-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>ID Anonim Baru</h4>
                    <p>Generate ID anonim baru untuk forum. ID lama: {{ user.anonymousId }}</p>
                  </div>
                  <button class="btn btn-secondary btn-sm" @click="regenerateAnonymousId">
                    🔄 Generate Baru
                  </button>
                </div>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Hapus Riwayat Chat</h4>
                    <p>Menghapus semua riwayat percakapan dengan AI</p>
                  </div>
                  <button class="btn btn-danger btn-sm" @click="showDeleteModal = true">
                    🗑️ Hapus Riwayat
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Logout -->
            <div class="card animate-fade-in" style="margin-top: 24px; text-align: center;">
              <button class="btn btn-outline" @click="logout" style="width: 100%;">
                🚪 Keluar dari Akun
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <modal-component 
        :show="showDeleteModal" 
        title="⚠️ Konfirmasi Hapus"
        @close="showDeleteModal = false"
      >
        <div class="delete-confirmation">
          <p>Apakah kamu yakin ingin menghapus semua riwayat chat?</p>
          <p style="color: var(--danger); margin-top: 8px;">
            <strong>Tindakan ini tidak dapat dibatalkan!</strong>
          </p>
          
          <div class="modal-actions" style="margin-top: 24px; display: flex; gap: 12px;">
            <button class="btn btn-secondary" @click="showDeleteModal = false" style="flex: 1;">
              Batal
            </button>
            <button class="btn btn-danger" @click="deleteHistory" style="flex: 1;">
              Hapus Semua
            </button>
          </div>
        </div>
      </modal-component>
    </div>
  `,
  data() {
    return {
      user: {
        name: '',
        email: '',
        nim: '',
        anonymousId: ''
      },
      editForm: {
        name: '',
        email: '',
        nim: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      showDeleteModal: false,
      loading: false
    }
  },
  async created() {
    await this.loadProfile();
  },
  methods: {
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    async loadProfile() {
      try {
        const profile = await api.getProfile();
        this.user = {
          name: profile.full_name,
          email: profile.email,
          nim: profile.nim,
          anonymousId: profile.anonymous_id
        };
        this.editForm = {
          name: profile.full_name,
          email: profile.email,
          nim: profile.nim
        };
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          this.user = {
            name: parsed.full_name || parsed.name,
            email: parsed.email,
            nim: parsed.nim,
            anonymousId: parsed.anonymous_id || parsed.anonymousId
          };
          this.editForm = { ...this.user };
        }
      }
    },

    async updateProfile() {
      try {
        const result = await api.updateProfile({ full_name: this.editForm.name });
        this.user.name = result.full_name;
        localStorage.setItem('user', JSON.stringify({
          ...this.user,
          full_name: result.full_name
        }));
        alert('Profil berhasil diperbarui!');
      } catch (error) {
        alert(error.message || 'Gagal memperbarui profil.');
      }
    },

    async changePassword() {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert('Password baru tidak cocok!');
        return;
      }

      if (this.passwordForm.newPassword.length < 8) {
        alert('Password minimal 8 karakter!');
        return;
      }

      try {
        await api.changePassword(this.passwordForm.oldPassword, this.passwordForm.newPassword);
        alert('Password berhasil diubah!');
        this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
      } catch (error) {
        alert(error.message || 'Gagal mengubah password.');
      }
    },

    async regenerateAnonymousId() {
      try {
        const result = await api.regenerateAnonymousId();
        this.user.anonymousId = result.anonymous_id;
        localStorage.setItem('user', JSON.stringify({
          ...this.user,
          anonymous_id: result.anonymous_id
        }));
        alert('ID Anonim baru: ' + result.anonymous_id);
      } catch (error) {
        alert(error.message || 'Gagal generate ID baru.');
      }
    },

    async deleteHistory() {
      try {
        await api.deleteAllHistory();
        alert('Riwayat chat berhasil dihapus!');
        this.showDeleteModal = false;
      } catch (error) {
        alert(error.message || 'Gagal menghapus riwayat.');
      }
    },

    logout() {
      api.logout();
      this.$router.push('/login');
    }
  }
};
