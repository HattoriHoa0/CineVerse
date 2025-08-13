<template>
  <div class="watchlists-view-container min-vh-100 py-5">
    <div class="container">
      <div v-if="userProfile" class="profile-header glassmorphism-card p-4 mb-5 text-center text-md-start">
        <div class="d-flex flex-column flex-md-row align-items-center">
          <img :src="userProfile.avatar_url || 'https://placehold.co/100x100/5A42D4/F5F5FA?text=AVT'" alt="User Avatar"
            class="profile-avatar rounded-circle mb-3 mb-md-0 me-md-4" />
          <div>
            <h1 class="text-starlight-yellow-glow mb-1">{{ userProfile.username }}</h1>
            <p class="text-nebula-white-light mb-2">{{ userProfile.email }}</p>
            <div class="d-flex flex-wrap justify-content-center justify-content-md-start gap-3">
              <span class="badge bg-purple-gradient p-2">
                <i class="bi bi-film me-1"></i> Đã xem: {{ userProfile.stats?.moviesWatched || 0 }}
              </span>
              <span class="badge bg-blue-gradient p-2">
                <i class="bi bi-clock me-1"></i> Giờ xem: {{ userProfile.stats?.hoursWatched || 0 }}h
              </span>
              <span class="badge bg-yellow-gradient p-2">
                <i class="bi bi-star me-1"></i> Đánh giá: {{ userProfile.stats?.reviewsCount || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ul class="nav nav-pills nav-fill mb-4" role="tablist">
        <li class="nav-item" role="presentation" v-for="tab in tabs" :key="tab.id">
          <button class="nav-link custom-tab-link" :class="{ 'active': activeTab === tab.id }"
            @click="activeTab = tab.id" type="button" role="tab">
            {{ tab.name }}
          </button>
        </li>
      </ul>

      <div class="tab-content">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-starlight-yellow" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
        </div>
        <div v-else-if="watchlist.length === 0" class="text-center py-5 glassmorphism-card p-4">
          <p class="lead text-nebula-white-light">
            Bạn chưa có phim nào trong danh sách này.
          </p>
          <button class="btn gradient-button-small mt-3">
            <i class="bi bi-plus-circle me-2"></i>Thêm phim ngay
          </button>
        </div>
        <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div class="col" v-for="(item, index) in watchlist" :key="item.watchlist_id">
            <div class="watchlist-item glassmorphism-card d-flex p-3 rounded">
              <img :src="item.poster_url" :alt="item.title" class="watchlist-item-poster rounded me-3" />
              <div class="flex-grow-1">
                <h5 class="text-starlight-yellow-glow mb-1">{{ item.title }}</h5>
                <p class="text-nebula-white-light small mb-2">{{ item.release_year }} | {{ item.type }}</p>
                <div class="progress custom-progress mb-2" v-if="item.type !== 'movie' && item.episode_count > 0">
                  <div class="progress-bar bg-purple-gradient" role="progressbar"
                    :style="{ width: calculateProgress(item) + '%' }" :aria-valuenow="calculateProgress(item)">
                    {{ item.current_episode }}/{{ item.episode_count }}
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-3">
                  <!-- Edit -->
                  <!-- <button class="btn btn-sm btn-outline-light custom-outline-btn"><i
                      class="fa-solid fa-pen-to-square"></i></button> -->
                  <!-- View -->
                  <router-link :to="{ name: 'movie.detail', params: { id: item.movie_id } }"
                    class="btn btn-sm btn-outline-light custom-outline-btn"><i
                      class="fa-solid fa-eye"></i></router-link>
                  <!-- Trash -->
                  <button class="btn btn-sm btn-outline-danger custom-outline-btn"
                    @click="handleRemoveFromWatchlist(item, index)"><i class="fa-solid fa-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '@/stores/auth';
import cineverseService from '@/services/cineverse.service';

// --- State Management & Client ---
const authStore = useAuthStore();
const queryClient = useQueryClient(); // Lấy query client để thao tác với cache

// --- State cục bộ ---
const activeTab = ref('watching');
const tabs = [
  { id: 'watching', name: 'Đang xem' },
  { id: 'completed', name: 'Đã xem' },
  { id: 'plan_to_watch', name: 'Muốn xem' },
  { id: 'dropped', name: 'Bỏ dở' },
];

// --- Queries (Lấy dữ liệu từ server) ---

// Query 1: Lấy thông tin hồ sơ người dùng
const { data: userProfile, isLoading: isProfileLoading } = useQuery({
  queryKey: ['userProfile'],
  queryFn: () => cineverseService.getUserProfile(),
  enabled: computed(() => authStore.isAuthenticated), // Chỉ chạy query khi đã đăng nhập
});

// Query 2: Lấy danh sách xem (watchlist), tự động chạy lại khi activeTab thay đổi
const { data: watchlist, isLoading: isWatchlistLoading } = useQuery({
  // queryKey chứa cả activeTab để nó trở nên reactive
  queryKey: ['watchlist', activeTab],
  queryFn: ({ queryKey }) => {
    // queryKey[1] chính là giá trị của activeTab.value
    const status = queryKey[1];
    return cineverseService.getWatchlist({ status });
  },
  enabled: computed(() => authStore.isAuthenticated), // Chỉ chạy query khi đã đăng nhập
});

// --- Mutations (Thay đổi dữ liệu trên server) ---

// Mutation để xóa một mục khỏi danh sách xem
const { mutate: deleteWatchlistItem } = useMutation({
  mutationFn: (movieId) => cineverseService.deleteWatchlistItem(movieId),
  // Cập nhật giao diện tức thì (Optimistic Update) để có UX tốt nhất
  onMutate: async (movieIdToRemove) => {
    // 1. Hủy bỏ các query đang chạy để tránh ghi đè
    await queryClient.cancelQueries({ queryKey: ['watchlist', activeTab.value] });

    // 2. Lấy dữ liệu hiện tại từ cache
    const previousWatchlist = queryClient.getQueryData(['watchlist', activeTab.value]);

    // 3. Cập nhật cache với dữ liệu mới (xóa item)
    queryClient.setQueryData(['watchlist', activeTab.value], (oldData) =>
      oldData.filter(item => item.movie_id !== movieIdToRemove)
    );

    // 4. Trả về dữ liệu cũ để có thể khôi phục nếu gặp lỗi
    return { previousWatchlist };
  },
  // Nếu có lỗi, khôi phục lại dữ liệu cũ
  onError: (err, variables, context) => {
    if (context.previousWatchlist) {
      queryClient.setQueryData(['watchlist', activeTab.value], context.previousWatchlist);
    }
    alert('Không thể xóa phim. Vui lòng thử lại.');
  },
  // Dù thành công hay thất bại, luôn làm mới lại dữ liệu từ server để đảm bảo tính nhất quán
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['watchlist', activeTab.value] });
  },
});


// --- Methods ---
const handleRemoveFromWatchlist = (itemToRemove) => {
  if (confirm(`Bạn có chắc chắn muốn xóa "${itemToRemove.title}" khỏi danh sách?`)) {
    deleteWatchlistItem(itemToRemove.movie_id); // Gọi mutation
  }
};

const calculateProgress = (item) => {
  if (item.current_episode >= 0 && item.episode_count > 0) {
    return Math.round((item.current_episode / item.episode_count) * 100);
  }
  return 0;
};

// Gộp trạng thái loading để dùng trong template
const loading = computed(() => isProfileLoading.value || isWatchlistLoading.value);

</script>

<style scoped>
/* File CSS cho trang quản lý watchlist */
.watchlists-view-container {
  background-color: var(--deep-space-black);
  background-image: url(https://wallpapers.com/images/high/void-5sm9tokk2youui90.webp);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  color: var(--nebula-white);
}

.watchlists-view-container .container {
  padding-top: 50px;
}

/* --- Các style cho hiệu ứng và layout --- */
.glassmorphism-card {
  background: var(--surface-glass);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--border-glass);
  border-radius: 1rem;
}

.profile-header {
  box-shadow: 0 0 20px rgba(46, 115, 232, 0.3), 0 0 30px rgba(90, 66, 212, 0.3);
  margin-top: 40px;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 3px solid var(--starlight-yellow);
  box-shadow: 0 0 10px rgba(255, 217, 77, 0.5);
}

.text-starlight-yellow-glow {
  color: var(--starlight-yellow);
  text-shadow: 0 0 5px rgba(255, 217, 77, 0.7);
}

.badge {
  font-size: 0.9em;
  font-weight: 500;
  padding: 0.5em 0.8em;
}

.bg-purple-gradient {
  background: linear-gradient(45deg, var(--galaxy-purple), var(--cosmic-blue));
}

.bg-blue-gradient {
  background: linear-gradient(45deg, var(--cosmic-blue), #3e7cff);
}

.bg-yellow-gradient {
  background: linear-gradient(45deg, var(--starlight-yellow), #ffda4d);
  color: var(--deep-space-black);
}

/* --- Styles cho Tab --- */
.custom-tab-link {
  color: var(--nebula-white);
  transition: all 0.3s ease;
  font-weight: 600;
  border-radius: 0.75rem;
  background-color: var(--surface-glass);
  border: 1px solid var(--border-glass);
}

.custom-tab-link:hover {
  color: var(--starlight-yellow);
  border-color: var(--starlight-yellow);
}

.custom-tab-link.active {
  background: linear-gradient(90deg, var(--galaxy-purple), var(--cosmic-blue));
  border-color: var(--cosmic-blue);
  box-shadow: 0 0 10px rgba(46, 115, 232, 0.5);
}

/* --- Styles cho Item trong danh sách --- */
.watchlist-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.watchlist-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.5);
}

.watchlist-item-poster {
  width: 100px;
  height: 150px;
  object-fit: cover;
  flex-shrink: 0;
}

.custom-progress {
  height: 10px;
  background-color: rgba(245, 245, 250, 0.1);
  border-radius: 5px;
  font-size: 0.7em;
  color: var(--nebula-white);
}

.custom-outline-btn:hover {
  background-color: var(--cosmic-blue) !important;
  border-color: var(--cosmic-blue) !important;
  color: var(--nebula-white) !important;
}
</style>