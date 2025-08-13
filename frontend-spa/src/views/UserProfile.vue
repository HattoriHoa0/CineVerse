<template>
  <div class="profile-page">
    <div class="container">
      <div v-if="!user" class="loading-state">
        <div class="spinner-border" role="status"></div>
        <p>Đang tải hồ sơ...</p>
      </div>

      <div v-else class="profile-layout">
        <aside class="profile-sidebar">
          <div class="profile-card">
            <div class="avatar-section">
              <input type="file" ref="fileInput" @change="handleAvatarUpload" accept="image/*" hidden />
              <div v-if="isUploading" class="uploading-overlay">
                <div class="spinner-border text-light" role="status"></div>
              </div>
              <img v-if="user.avatar_url" :src="user.avatar_url" alt="User Avatar" class="user-avatar">
              <div v-else class="default-avatar"><i class="bi bi-person-fill"></i></div>
              <button @click="triggerFileInput" class="change-avatar-btn" title="Thay đổi ảnh đại diện"
                :disabled="isUploading">
                <i class="bi bi-camera-fill"></i>
              </button>
            </div>
            <div class="info-section">
              <h1 class="username">{{ user.username }}</h1>
              <p class="email text-secondary">{{ user.email }}</p>
              <p class="join-date text-secondary">
                <i class="bi bi-calendar3"></i>
                Thành viên từ {{ formattedJoinDate }}
              </p>
            </div>
            <div class="stats-section">
              <div class="stat-item">
                <span class="stat-value">128</span>
                <span class="stat-label">Phim đã xem</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ watchlist.length }}</span>
                <span class="stat-label">Đang theo dõi</span>
              </div>
            </div>
            <div class="actions-section">
              <button class="btn-edit-profile">Chỉnh sửa hồ sơ</button>
            </div>
          </div>
        </aside>

        <main class="profile-main-content">
          <nav class="content-tabs">
            <button :class="['tab-btn', { active: activeTab === 'watchlist' }]" @click="setActiveTab('watchlist')">
              <i class="bi bi-bookmark-fill"></i> Watchlist
            </button>
            <button :class="['tab-btn', { active: activeTab === 'favorites' }]" @click="setActiveTab('favorites')">
              <i class="bi bi-heart-fill"></i> Yêu thích
            </button>
            <button :class="['tab-btn', { active: activeTab === 'settings' }]" @click="setActiveTab('settings')">
              <i class="bi bi-gear-fill"></i> Cài đặt
            </button>
          </nav>

          <div class="tab-content">
            <div v-if="activeTab === 'watchlist'" class="watchlist-grid">
              <div v-for="movie in watchlist" :key="movie.id" class="movie-card">
                <img :src="movie.poster_url" :alt="movie.title" class="movie-poster">
                <div class="movie-info">
                  <h5 class="movie-title">{{ movie.title }}</h5>
                  <p class="movie-year">{{ new Date(movie.release_date).getFullYear() }}</p>
                </div>
              </div>
            </div>
            <div v-if="activeTab === 'favorites'" class="placeholder-content">
              <i class="bi bi-heart-fill"></i>
              <h3>Danh sách yêu thích</h3>
              <p>Các bộ phim bạn yêu thích sẽ xuất hiện ở đây.</p>
            </div>
            <div v-if="activeTab === 'settings'" class="placeholder-content">
              <i class="bi bi-gear-fill"></i>
              <h3>Cài đặt tài khoản</h3>
              <p>Các tùy chọn cài đặt sẽ được cập nhật trong tương lai.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '@/stores/auth';
import cineverseService from '@/services/cineverse.service';

// --- Khởi tạo ---
const authStore = useAuthStore();
const queryClient = useQueryClient();

// --- State cục bộ cho UI ---
const activeTab = ref('watchlist');
const fileInput = ref(null);

// --- QUERIES (Lấy dữ liệu) ---

// Query 1: Lấy thông tin hồ sơ người dùng
const { data: user, isLoading: isLoadingProfile } = useQuery({
  queryKey: ['userProfile', authStore.currentUser?.user_id],
  queryFn: () => cineverseService.getUserProfile(),
  enabled: computed(() => authStore.isAuthenticated),
});

// Query 2: Lấy danh sách phim đang theo dõi
const { data: watchlist, isLoading: isLoadingWatchlist } = useQuery({
  queryKey: ['watchlist', authStore.currentUser?.user_id],
  queryFn: () => cineverseService.getWatchlist(),
  enabled: computed(() => authStore.isAuthenticated),
  initialData: [], // Khởi tạo với mảng rỗng để UI không bị lỗi
});

// --- MUTATION (Thay đổi dữ liệu) ---

// Mutation cho việc upload avatar
const { mutate: uploadAvatar, isPending: isUploading } = useMutation({
  mutationFn: (formData) => cineverseService.uploadAvatar(formData),
  onSuccess: (response) => {
    const newAvatarUrl = response.avatar_url;
    // Cập nhật trong Pinia store
    authStore.updateUserAvatar(newAvatarUrl);
    // Vô hiệu hóa và tải lại query 'userProfile' để giao diện được cập nhật
    queryClient.invalidateQueries({ queryKey: ['userProfile', authStore.currentUser?.user_id] });
  },
  onError: (error) => {
    alert('Upload avatar thất bại! ' + (error.message || 'Vui lòng thử lại.'));
  },
});


// --- Handlers ---
const setActiveTab = (tabName) => {
  activeTab.value = tabName;
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleAvatarUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    return alert('Vui lòng chỉ chọn file hình ảnh.');
  }
  if (file.size > 2 * 1024 * 1024) { // 2MB limit
    return alert('Kích thước file không được vượt quá 2MB.');
  }

  const formData = new FormData();
  formData.append('avatar', file);
  uploadAvatar(formData); // Gọi mutation
  fileInput.value.value = ''; // Reset input
};

// --- Computed Properties ---
const formattedJoinDate = computed(() => {
  if (!user.value?.created_at) return '';
  const date = new Date(user.value.created_at);
  return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
});
</script>

<style scoped>
/* Các style được giữ nguyên vì đã được tổ chức tốt */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");

.profile-page {
  background-color: var(--deep-space-black);
  background-image: linear-gradient(175deg, rgba(46, 115, 232, 0.1) -10%, rgba(90, 66, 212, 0.15) 40%, var(--deep-space-black) 80%);
  color: var(--nebula-white);
  padding: 4rem 0;
  min-height: 100vh;
  padding-top: 80px;
}

.loading-state {
  text-align: center;
  padding: 5rem;
}

.profile-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

/* Sidebar */
.profile-sidebar {
  position: sticky;
  top: 2rem;
}

.profile-card {
  background: var(--surface-glass);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid var(--border-glass);
  padding: 2rem;
  text-align: center;
}

/* Avatar */
.avatar-section {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem auto;
}

.user-avatar,
.default-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--deep-space-black);
  box-shadow: 0 0 0 4px var(--galaxy-purple);
}

.default-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-glass);
}

.default-avatar .bi {
  font-size: 4rem;
}

.change-avatar-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--galaxy-purple);
  color: var(--nebula-white);
  border: 2px solid var(--deep-space-black);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
}

.uploading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.avatar-section:hover .change-avatar-btn {
  opacity: 1;
  transform: scale(1.1);
}

/* Thông tin & Thống kê */
.info-section .username {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.info-section .email,
.info-section .join-date {
  color: var(--text-secondary);
}

.stats-section {
  display: flex;
  justify-content: space-around;
  margin: 2rem 0;
  padding: 1rem 0;
  border-top: 1px solid var(--border-glass);
  border-bottom: 1px solid var(--border-glass);
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.btn-edit-profile {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-glass);
  background: transparent;
  color: var(--nebula-white);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit-profile:hover {
  background: var(--starlight-yellow);
  border-color: var(--starlight-yellow);
  color: var(--deep-space-black);
}

/* Nội dung chính */
.profile-main-content {
  background: var(--surface-glass);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid var(--border-glass);
  overflow: hidden;
}

.content-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-glass);
  padding: 0.5rem 1.5rem;
}

.tab-btn {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-secondary);
  position: relative;
  transition: color 0.3s ease;
}

.tab-btn::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--starlight-yellow);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tab-btn.active {
  color: var(--starlight-yellow);
}

.tab-btn.active::after {
  transform: scaleX(1);
}

.tab-content {
  padding: 2rem;
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.movie-card {
  transition: transform 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 8px;
}

.movie-title {
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0.5rem;
}

.placeholder-content {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 992px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}
</style>