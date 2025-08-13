<template>
  <div class="auth-view-container d-flex justify-content-center align-items-center min-vh-100">
    <div class="auth-card p-4 rounded shadow-lg text-nebula-white">
      
      <div v-if="viewMode === 'auth'">
        <h2 class="text-center mb-4 display-5 fw-bold text-starlight-yellow-glow">
          Chào mừng đến với CineVerse
        </h2>

        <ul class="nav nav-pills nav-fill mb-4" id="pills-tab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link custom-tab-link" :class="{ 'active': activeTab === 'login' }"
              @click="switchTab('login')" type="button">
              Đăng nhập
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link custom-tab-link" :class="{ 'active': activeTab === 'register' }"
              @click="switchTab('register')" type="button">
              Đăng ký
            </button>
          </li>
        </ul>

        <div v-if="formMessage.text" class="alert mb-4" :class="alertClass" role="alert">
          {{ formMessage.text }}
        </div>

        <div class="tab-content" id="pills-tabContent">
          <!-- Form Đăng nhập -->
          <div class="tab-pane fade" :class="{ 'show active': activeTab === 'login' }" role="tabpanel">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="loginEmail" class="form-label">Email</label>
                <input type="email" class="form-control custom-input" id="loginEmail" v-model="loginForm.email" required />
              </div>
              <div class="mb-3">
                <label for="loginPassword" class="form-label">Mật khẩu</label>
                <input type="password" class="form-control custom-input" id="loginPassword" v-model="loginForm.password" required />
              </div>
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="rememberMe" />
                  <label class="form-check-label" for="rememberMe">Ghi nhớ tôi</label>
                </div>
                <a href="#" @click.prevent="viewMode = 'forgotPassword'" class="text-cosmic-blue-light text-decoration-none small">Quên mật khẩu?</a>
              </div>
              <button type="submit" class="btn w-100 gradient-button btn-lg" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                Đăng nhập
              </button>
            </form>
          </div>

          <!-- Form Đăng ký -->
          <div class="tab-pane fade" :class="{ 'show active': activeTab === 'register' }" role="tabpanel">
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="registerUsername" class="form-label">Tên người dùng</label>
                <input type="text" class="form-control custom-input" id="registerUsername" v-model="registerForm.username" required />
              </div>
              <div class="mb-3">
                <label for="registerEmail" class="form-label">Email</label>
                <input type="email" class="form-control custom-input" id="registerEmail" v-model="registerForm.email" required />
              </div>
              <div class="mb-3">
                <label for="registerPassword" class="form-label">Mật khẩu</label>
                <input type="password" class="form-control custom-input" id="registerPassword" v-model="registerForm.password" required />
              </div>
              <div class="mb-4">
                <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
                <input type="password" class="form-control custom-input" id="confirmPassword" v-model="registerForm.confirmPassword" required />
              </div>
              <button type="submit" class="btn w-100 gradient-button btn-lg" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        <p class="text-center mt-4 small">
          Hoặc tiếp tục với
          <a href="#" class="text-cosmic-blue-light text-decoration-none ms-1 me-1"><i class="bi bi-google"></i> Google</a>
          <a href="#" class="text-cosmic-blue-light text-decoration-none"><i class="bi bi-facebook"></i> Facebook</a>
        </p>
      </div>

      <!--Quên mật khẩu -->
      <div v-if="viewMode === 'forgotPassword'">
        <h3 class="text-center mb-4 fw-bold text-starlight-yellow-glow">Khôi phục mật khẩu</h3>
        <p class="text-center text-white-50 mb-4">Nhập email của bạn và chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu.</p>
        
        <div v-if="formMessage.text" class="alert mb-4" :class="alertClass" role="alert">
          {{ formMessage.text }}
        </div>

        <form @submit.prevent="handleForgotPassword">
          <div class="mb-3">
            <label for="forgotEmail" class="form-label">Email</label>
            <input type="email" class="form-control custom-input" id="forgotEmail" v-model="forgotPasswordForm.email" required />
          </div>
          <button type="submit" class="btn w-100 gradient-button btn-lg mt-4" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            Gửi liên kết khôi phục
          </button>
        </form>

        <div class="text-center mt-4">
            <a href="#" @click.prevent="viewMode = 'auth'; resetMessage()" class="text-cosmic-blue-light text-decoration-none small">
                <i class="bi bi-arrow-left me-1"></i> Quay lại đăng nhập
            </a>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// Import các hooks cần dùng từ Vue và Vue Query
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@tanstack/vue-query';

// Import service API và Pinia store
import cineverseService from '@/services/cineverse.service';
import { useAuthStore } from '@/stores/auth';
// Khởi tạo router và store
const router = useRouter(); // Điều hướng sau khi đăng nhập thành công
const authStore = useAuthStore(); // Store quản lý đăng nhập
// Các biến trạng thái UI
const activeTab = ref('login');         // Tab đang hiển thị (login / register)
const viewMode = ref('auth');           // Hiển thị chế độ nào (auth hoặc forgotPassword)
const formMessage = ref({ text: null, type: null }); // Hiển thị thông báo lỗi/thành công
// Dữ liệu ràng buộc với các form
const loginForm = reactive({ email: '', password: '' });
const registerForm = reactive({ username: '', email: '', password: '', confirmPassword: '' });
const forgotPasswordForm = reactive({ email: '' }); // (chưa xử lý server)

// --- MUTATIONS ---

// Mutation cho việc Đăng nhập
const { mutate: login, isPending: isLoginLoading } = useMutation({
  mutationFn: (credentials) => cineverseService.login(credentials), // Gửi API login
  onSuccess: (responseData) => {
    authStore.setAuth(responseData.user, responseData.token); // Lưu vào Pinia
    formMessage.value = { text: 'Đăng nhập thành công!', type: 'success' };
    setTimeout(() => router.push({ name: 'home' }), 1000); // Điều hướng về trang chủ
  },
  onError: (error) => {
    formMessage.value = { text: error.message || 'Đăng nhập thất bại.', type: 'error' };
  }
});


// Mutation cho việc Đăng ký
const { mutate: register, isPending: isRegisterLoading } = useMutation({
  mutationFn: (userData) => cineverseService.register(userData), // Gửi API register
  onSuccess: () => {
    formMessage.value = { text: 'Đăng ký thành công! Vui lòng đăng nhập.', type: 'success' };

    // Lưu lại email để chuyển sang form đăng nhập tự động
    const registeredEmail = registerForm.email;

    // Reset form
    Object.assign(registerForm, { username: '', email: '', password: '', confirmPassword: '' });

    // Sau vài giây chuyển tab về đăng nhập
    setTimeout(() => {
      loginForm.email = registeredEmail;
      switchTab('login');
    }, 2000);
  },
  onError: (error) => {
    formMessage.value = { text: error.message || 'Đăng ký thất bại.', type: 'error' };
  }
});


// --- Handlers (Chỉ gọi các mutation) ---

const handleLogin = () => {
  resetMessage(); // Xóa thông báo cũ
  login(loginForm); // Gọi mutation đăng nhập
};

const handleRegister = () => {
  resetMessage();

  // Kiểm tra mật khẩu và xác nhận khớp nhau
  if (registerForm.password !== registerForm.confirmPassword) {
    formMessage.value = { text: 'Mật khẩu và xác nhận mật khẩu không khớp.', type: 'error' };
    return;
  }

  // Gọi mutation đăng ký
  register({
    username: registerForm.username,
    email: registerForm.email,
    password: registerForm.password,
  });
};


// --- Các hàm tiện ích ---
// Trạng thái loading chung (đăng nhập hoặc đăng ký)
const isLoading = computed(() => isLoginLoading.value || isRegisterLoading.value);

// Class của alert dựa trên type (success / error)
const alertClass = computed(() =>
  formMessage.value.type === 'success' ? 'alert-success' : 'alert-danger'
);

// Đặt lại thông báo
const resetMessage = () => formMessage.value = { text: null, type: null };

// Chuyển đổi tab (login <-> register)
const switchTab = (tab) => {
  activeTab.value = tab;
  resetMessage();
};

</script>

<style scoped>
.auth-view-container {
  background-color: var(--deep-space-black);
  background-image: linear-gradient(175deg,
      rgba(46, 115, 232, 0.1) -10%,
      rgba(90, 66, 212, 0.15) 40%,
      var(--deep-space-black) 80%);
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Be Vietnam Pro', sans-serif;
  color: var(--nebula-white);
  padding-top: 100px; 
  padding-bottom: 2rem;
}

.auth-card {
  background: var(--surface-glass);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--border-glass);
  border-radius: 1rem;
  padding: 3rem;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  position: relative;
  overflow: hidden;
}

.text-starlight-yellow-glow {
  color: var(--starlight-yellow);
  text-shadow: 0 0 5px rgba(255, 217, 77, 0.7), 0 0 10px rgba(255, 217, 77, 0.5);
}

.custom-tab-link {
  color: var(--nebula-white);
  border: 1px solid var(--border-glass);
  background-color: transparent;
  transition: all 0.3s ease;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
}

.custom-tab-link:hover {
  background-color: rgba(245, 245, 250, 0.1);
  color: var(--starlight-yellow);
  border-color: var(--starlight-yellow);
}

.custom-tab-link.active {
  background: linear-gradient(90deg, var(--galaxy-purple), var(--cosmic-blue));
  border-color: var(--cosmic-blue);
  color: var(--nebula-white);
  box-shadow: 0 0 10px rgba(46, 115, 232, 0.5);
}

.custom-input {
  background-color: rgba(245, 245, 250, 0.08);
  border: 1px solid var(--border-glass);
  color: var(--nebula-white);
  padding: 0.75rem 1.25rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.custom-input:focus {
  background-color: rgba(245, 245, 250, 0.15);
  border-color: var(--cosmic-blue);
  box-shadow: 0 0 0 0.25rem rgba(46, 115, 232, 0.25);
  color: var(--nebula-white);
}

.custom-input::placeholder {
  color: rgba(245, 245, 250, 0.6);
}

.gradient-button {
  background: linear-gradient(90deg, var(--galaxy-purple), var(--cosmic-blue));
  border: none;
  color: var(--nebula-white);
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.gradient-button:hover {
  background: linear-gradient(90deg, var(--cosmic-blue), var(--galaxy-purple));
  box-shadow: 0 6px 20px rgba(46, 115, 232, 0.4);
  transform: translateY(-2px);
}

.text-cosmic-blue-light {
  color: var(--cosmic-blue) !important;
}

.text-cosmic-blue-light:hover {
  color: var(--starlight-yellow) !important;
}

body {
  font-family: 'Be Vietnam Pro', sans-serif;
}
</style>