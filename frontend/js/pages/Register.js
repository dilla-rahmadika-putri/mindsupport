// Register Page Component
const Register = {
  template: `
    <div class="login-page">
      <div class="login-bg"></div>
      <div class="login-container">
        <div class="login-card card card-glass animate-slide-up">
          <div class="login-header">
            <div class="logo">
              <span class="logo-icon">🧠</span>
              <span class="logo-text">MindSupport</span>
            </div>
            <p class="login-subtitle">Daftar Akun Baru</p>
          </div>
          
          <form @submit.prevent="handleRegister" class="login-form">
            <div class="form-group">
              <label class="form-label">Nama Lengkap</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="formData.name"
                placeholder="Masukkan nama lengkap"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">NIM</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="formData.nim"
                placeholder="Contoh: 12345678"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">Email Kampus</label>
              <input 
                type="email" 
                class="form-input" 
                v-model="formData.email"
                placeholder="nama@kampus.ac.id"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">Password</label>
              <input 
                type="password" 
                class="form-input" 
                v-model="formData.password"
                placeholder="Minimal 8 karakter"
                required
                minlength="8"
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">Konfirmasi Password</label>
              <input 
                type="password" 
                class="form-input" 
                v-model="formData.confirmPassword"
                placeholder="Ulangi password"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="agreeTerms" required>
                <span>Saya setuju dengan <a href="#">Syarat & Ketentuan</a></span>
              </label>
            </div>
            
            <button type="submit" class="btn btn-primary btn-lg" :disabled="loading" style="width: 100%;">
              <span v-if="loading">Mendaftar...</span>
              <span v-else>Daftar</span>
            </button>
            
            <p v-if="error" class="error-message">{{ error }}</p>
            <p v-if="success" class="success-message">{{ success }}</p>
          </form>
          
          <div class="login-footer" style="margin-top: 24px;">
            <p>Sudah punya akun?</p>
            <router-link to="/login" class="btn btn-outline" style="width: 100%;">
              Masuk
            </router-link>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      formData: {
        name: '',
        nim: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      agreeTerms: false,
      loading: false,
      error: null,
      success: null
    }
  },
  methods: {
    async handleRegister() {
      this.loading = true;
      this.error = null;
      this.success = null;

      // Validation
      if (this.formData.password !== this.formData.confirmPassword) {
        this.error = 'Password tidak cocok';
        this.loading = false;
        return;
      }

      if (!this.agreeTerms) {
        this.error = 'Anda harus menyetujui syarat dan ketentuan';
        this.loading = false;
        return;
      }

      try {
        // Call real API
        const result = await api.register({
          email: this.formData.email,
          password: this.formData.password,
          full_name: this.formData.name,
          nim: this.formData.nim
        });

        this.success = 'Pendaftaran berhasil! Mengalihkan ke dashboard...';

        // Redirect to dashboard (already logged in from registration)
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 1500);

      } catch (err) {
        this.error = err.message || 'Terjadi kesalahan. Silakan coba lagi.';
      } finally {
        this.loading = false;
      }
    }
  }
};
