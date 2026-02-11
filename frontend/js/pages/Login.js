// Login Page Component
const Login = {
  template: `
    <div class="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col text-text-main dark:text-white transition-colors duration-300">
      <!-- Navbar -->
      <header class="w-full border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Logo -->
            <div class="size-8 text-primary">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill-rule="evenodd"></path>
              </svg>
            </div>
            <h2 class="text-text-main dark:text-white text-xl font-bold tracking-tight">MindSupport</h2>
          </div>
          <a class="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors" href="#">
            <span class="material-symbols-outlined text-[18px]">help</span>
            Bantuan
          </a>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <!-- Decorative Background Blobs -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div class="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
          <div class="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[80px]"></div>
        </div>

        <!-- Login Card -->
        <div class="flex flex-col md:flex-row w-full max-w-[1000px] bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-border-light dark:border-border-dark overflow-hidden min-h-[640px]">
          <!-- Left Panel (Brand/Visuals) -->
          <div class="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary/5 to-purple-100/30 dark:from-primary/10 dark:to-surface-dark p-12 relative">
            <!-- Content -->
            <div class="relative z-10">
              <span class="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-6 uppercase tracking-wider">Student Mental Health</span>
              <h1 class="text-4xl font-black text-text-main dark:text-white mb-4 leading-tight tracking-tight">Ruang Aman untuk Ceritamu</h1>
              <p class="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                Platform konseling sebaya dan dukungan AI yang dirancang khusus untuk mahasiswa. Bebas stigma dan penuh empati.
              </p>
            </div>

            <!-- Abstract Illustration Area -->
            <div class="relative z-10 mt-auto w-full aspect-[4/3] rounded-xl overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <div class="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-blue-200/20"></div>
              <div class="text-center p-6">
                <div class="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="material-symbols-outlined text-primary text-3xl">psychology</span>
                </div>
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">"Kamu tidak sendirian. Kami di sini untuk mendengarkan."</p>
              </div>
            </div>
          </div>

          <!-- Right Panel (Form) -->
          <div class="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-surface-light dark:bg-surface-dark">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-text-main dark:text-white mb-2 tracking-tight">Selamat Datang</h2>
              <p class="text-slate-500 dark:text-slate-400">Silakan masuk dengan akun universitas Anda.</p>
            </div>

            <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
              <!-- NIM/Email Field -->
              <label class="flex flex-col gap-2 group">
                <span class="text-sm font-semibold text-text-main dark:text-slate-200">NIM / Email</span>
                <div class="relative flex items-center">
                  <input v-model="credentials.email" class="w-full h-14 rounded-xl border border-border-light dark:border-slate-600 bg-background-light dark:bg-background-dark text-text-main dark:text-white px-4 pl-12 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400" placeholder="Masukkan NIM atau Email Anda" type="text" required />
                  <div class="absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors flex items-center justify-center">
                    <span class="material-symbols-outlined">person</span>
                  </div>
                </div>
              </label>

              <!-- Password Field -->
              <label class="flex flex-col gap-2 group">
                <span class="text-sm font-semibold text-text-main dark:text-slate-200">Password</span>
                <div class="relative flex items-center">
                  <input v-model="credentials.password" :type="showPassword ? 'text' : 'password'" class="w-full h-14 rounded-xl border border-border-light dark:border-slate-600 bg-background-light dark:bg-background-dark text-text-main dark:text-white px-4 pl-12 pr-12 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400" placeholder="Masukkan password Anda" type="password" required />
                  <div class="absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors flex items-center justify-center">
                    <span class="material-symbols-outlined">lock</span>
                  </div>
                  <button type="button" @click="showPassword = !showPassword" class="absolute right-4 text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
                    <span class="material-symbols-outlined">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
                  </button>
                </div>
              </label>

              <!-- Forgot Password Link -->
              <div class="flex justify-between items-center -mt-1">
                 <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="rememberMe" class="rounded border-slate-300 text-primary focus:ring-primary">
                    <span class="text-sm text-slate-500">Ingat saya</span>
                 </label>
                 <a class="text-sm font-medium text-slate-500 hover:text-primary transition-colors underline decoration-slate-300 hover:decoration-primary" href="#">Lupa Password?</a>
              </div>

              <!-- Submit Button -->
              <button type="submit" :disabled="loading" class="mt-2 w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-glow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="loading">MEMPROSES...</span>
                <span v-else>MASUK</span>
              </button>
              
              <p v-if="error" class="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">{{ error }}</p>

              <!-- Privacy Badge -->
              <div class="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl mt-2 transition-colors">
                <div class="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg shrink-0">
                  <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[20px] block">verified_user</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-0.5">Privasi Terjamin</p>
                  <p class="text-xs text-emerald-700 dark:text-emerald-300/80 leading-relaxed">
                    Data Anda Aman. Identitas Anda tidak akan ditampilkan publik.
                  </p>
                </div>
              </div>
            </form>

            <div class="mt-8 pt-6 border-t border-border-light dark:border-border-dark text-center">
              <p class="text-slate-600 dark:text-slate-400">
                Belum punya akun? 
                <router-link to="/register" class="text-primary font-bold hover:underline ml-1">Daftar Sekarang</router-link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="py-6 text-center">
        <p class="text-xs text-slate-400 dark:text-slate-600">
          <a class="hover:text-primary" href="#">Kebijakan Privasi</a> • <a class="hover:text-primary" href="#">Syarat & Ketentuan</a>
        </p>
      </footer>
    </div>
  `,
  data() {
    return {
      credentials: {
        email: '',
        password: ''
      },
      showPassword: false,
      rememberMe: false,
      loading: false,
      error: null
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = null;

      try {
        // Validate input
        if (!this.credentials.email || !this.credentials.password) {
          this.error = 'Silakan masukkan NIM/Email dan password';
          return;
        }

        // Call real API
        await api.login(this.credentials.email, this.credentials.password);

        // Redirect to dashboard
        this.$router.push('/dashboard');
      } catch (err) {
        this.error = err.message || 'Terjadi kesalahan. Silakan coba lagi.';
      } finally {
        this.loading = false;
      }
    }
  }
};
