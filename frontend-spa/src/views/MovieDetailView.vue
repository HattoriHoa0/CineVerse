<template>
  <div class="cineverse-theme movie-detail-page">
    <div v-if="isLoading" class="loading-container d-flex justify-content-center align-items-center">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="container py-5 text-center">
      <div class="alert alert-danger">
        <h4 class="alert-heading">Đã xảy ra lỗi!</h4>
        <p>{{ error }}</p>
        <hr>
        <RouterLink to="/" class="btn btn-primary">Quay về trang chủ</RouterLink>
      </div>
    </div>

    <div v-else-if="movie">
      <header class="movie-banner" :style="{ backgroundImage: bannerImage }">
        <div class="banner-overlay">
          <div class="container">
            <div class="row align-items-center">
              <div class="col-md-4 text-center text-md-start">
                <img :src="movie.poster_url" :alt="`Poster of ${movie.title}`"
                  class="img-fluid rounded-3 shadow-lg movie-poster" @error="handleImageError">
              </div>
              <div class="col-md-8 mt-4 mt-md-0">
                <h1 class="display-4 fw-bold">{{ movie.title }}</h1>
                <p class="text-muted fst-italic">{{ movie.original_title }}</p>
                <div class="d-flex align-items-center gap-3 my-3">
                  <div v-if="movie.average_rating > 0" class="rating-badge">
                    <i class="fa-solid fa-star"></i>
                    {{ movie.average_rating }}
                  </div>
                  <span class="meta-info">{{ movie.release_year }}</span>
                  <span class="meta-info" v-if="movie.runtime_minutes">{{ formatDuration(movie.runtime_minutes)
                    }}</span>
                  <span class="meta-info" v-if="movie.episode_count && movie.type !== 'movie'">{{ movie.episode_count }}
                    tập</span>
                </div>
                <div class="genres my-3">
                  <span v-for="genre in movie.genres" :key="genre" class="badge genre-badge me-2">{{ genre }}</span>
                </div>
                <p class="lead synopsis" style="text-align: justify;">{{ movie.synopsis }}</p>

                <div class="action-buttons mt-4">
                  <div v-if="!authStore.isAuthenticated">
                    <button class="btn btn-accent btn-lg me-3" disabled>
                      <i class="fa-solid fa-plus"></i> Đăng nhập để thêm vào danh sách
                    </button>
                  </div>
                  <div v-else>
                    <button v-if="!currentWatchlistItem" class="btn btn-accent btn-lg me-3"
                      @click="handleAddToWatchlist" :disabled="isUpdatingWatchlist">
                      <i class="fa-solid fa-plus"></i>
                      {{ isUpdatingWatchlist ? 'Đang thêm...' : 'Thêm vào danh sách' }}
                    </button>

                    <div v-else class="watchlist-edit-form p-3 rounded-3 glass-surface">
                      <h5 class="mb-3">Chỉnh sửa danh sách xem</h5>

                      <div class="row g-2 align-items-end mb-3">
                        <div class="col-sm-7">
                          <label for="watchlistStatus" class="form-label text-light">Trạng thái:</label>
                          <select class="form-select form-select-sm custom-select" id="watchlistStatus"
                            v-model="watchlistForm.status">
                            <option value="watching">Đang xem</option>
                            <option value="completed">Đã xem</option>
                            <option value="plan_to_watch">Muốn xem</option>
                            <option value="dropped">Bỏ dở</option>
                          </select>
                        </div>

                        <div class="col-sm-5" v-if="movie.type === 'tv_series' || movie.type === 'anime_tv'">
                          <label for="currentEpisode" class="form-label text-light">Tập hiện tại:</label>
                          <input type="number" class="form-control form-control-sm custom-input" id="currentEpisode"
                            v-model.number="watchlistForm.currentEpisode" min="0" :max="movie.episode_count || 9999" />
                        </div>
                      </div>

                      <div class="row g-2">
                        <div class="d-flex gap-2">
                          <button class="btn gradient-button flex-grow-1" @click="handleUpdateWatchlist"
                            :disabled="isUpdatingWatchlist">
                            <i class="bi bi-arrow-clockwise me-1 text-light"></i>
                            {{ isUpdatingWatchlist ? 'Đang cập nhật...' : 'Cập nhật' }}
                          </button>

                          <button class="btn btn-outline-danger" @click="handleRemoveFromWatchlist"
                            :disabled="isUpdatingWatchlist">
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="container py-5">
        <div class="row">
          <div class="col-lg-8">
            <section v-if="movie.trailer_url" class="mb-5">
              <h3 class="section-title">Trailer</h3>
              <div class="ratio ratio-16x9 rounded-3 overflow-hidden">
                <iframe :src="getEmbedUrl(movie.trailer_url)" title="YouTube video player" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen></iframe>
              </div>
            </section>

            <section>
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="section-title mb-0">Bình luận & Đánh giá ({{ reviews.length }})</h3>
                <button v-if="authStore.isAuthenticated && !isWritingReview && !userHasReviewed"
                  @click="isWritingReview = true" class="btn btn-accent">
                  <i class="fa-solid fa-pen-to-square me-2"></i> Viết đánh giá
                </button>
              </div>

              <ReviewForm v-if="isWritingReview" :is-submitting="isSubmittingReview" @submit-review="handleReviewSubmit"
                @cancel="isWritingReview = false" />

              <div class="review-box glass-surface p-4 rounded-3">
                <div v-if="reviews.length === 0 && !isWritingReview" class="text-center text-light p-3">Chưa có đánh giá
                  nào. Hãy là người đầu tiên!</div>

                <div v-for="(review, index) in reviews" :key="review.review_id" class="review-item mb-4">
                  <ReviewForm v-if="editingReviewId === review.review_id" :is-submitting="isSubmittingReview"
                    :initial-comment="review.comment" :initial-rating="review.rating"
                    @submit-review="handleUpdateReviewSubmit" @cancel="editingReviewId = null" />

                  <div v-else>
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="d-flex align-items-center">
                        <img :src="review.avatar_url" class="rounded-circle me-3" width="50" height="50"
                          @error="handleImageError">
                        <div>
                          <h6 class="mb-0">{{ review.username }}</h6>
                          <p class="text-white-50 small mb-0">{{ formatDate(review.created_at) }}</p>
                        </div>
                      </div>
                      <div class="rating-display">
                        <i class="fa-solid fa-star me-1"></i>
                        <strong>{{ review.rating }}</strong>
                      </div>
                    </div>
                    <p class="mt-2 mb-2">{{ review.comment }}</p>

                    <div v-if="authStore.currentUser?.user_id === review.user_id" class="review-actions mt-2">
                      <button class="btn btn-sm btn-warning me-2 fw-bold"
                        @click="editingReviewId = review.review_id">Sửa</button>
                      <button class="btn btn-sm btn-danger fw-bold"
                        @click="handleDeleteReview(review.review_id, index)">Xóa</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside class="col-lg-4 mt-5 mt-lg-0">
            <div class="glass-sidebar p-4 rounded-3 sticky-top">
              <h4 class="sidebar-title">Thông tin</h4>
              <ul class="list-unstyled info-list">
                <li><strong>Trạng thái:</strong> <span>{{ movie.status }}</span></li>
                <li><strong>Ngôn ngữ gốc:</strong> <span>{{ movie.original_language || 'N/A' }}</span></li>
                <li><strong>Kinh phí:</strong> <span>{{ movie.budget ? `$${new
                  Intl.NumberFormat().format(movie.budget)}` : 'N/A' }}</span></li>
                <li><strong>Doanh thu:</strong> <span>{{ movie.revenue ? `$${new
                  Intl.NumberFormat().format(movie.revenue)}` : 'N/A' }}</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import cineverseService from '@/services/cineverse.service';
import { useAuthStore } from '@/stores/auth';
import ReviewForm from '@/components/ReviewForm.vue';

// --- Khởi tạo ---
const route = useRoute();
const authStore = useAuthStore();
const queryClient = useQueryClient();
const movieId = computed(() => route.params.id);

// --- Banner nền ngẫu nhiên ---
const imageUrls = [
  'https://wallpapers.com/images/high/earth-in-the-universe-a879b6hwwtbywot0.webp',
  'https://wallpapers.com/images/high/massive-glowing-black-hole-in-outer-space-qngqcv0ctzmhbqin.webp',
  'https://wallpapers.com/images/high/glimmering-view-of-jupiter-s-swirling-storms-from-orbit-dhl1zqfocnm26ot8.webp',
  'https://wallpapers.com/images/high/mysterious-exoplanet-orbiting-in-a-vibrant-cosmic-galaxy-with-glowing-nebulae-and-distant-stars-zfrdrrubov679nsw.webp',
  'https://wallpapers.com/images/high/void-5sm9tokk2youui90.webp',
  'https://wallpapers.com/images/hd/tree-and-vast-universe-hk1a2py5d3x1tpgf.webp',
  'https://cdn.pixabay.com/photo/2018/08/15/13/10/new-year-background-3608029_1280.jpg'
];
const randomIndex = Math.floor(Math.random() * imageUrls.length);
const bannerImage = `url(${imageUrls[randomIndex]})`;

// --- State cục bộ cho UI ---
const isWritingReview = ref(false);
const editingReviewId = ref(null);
const watchlistForm = ref({ status: 'plan_to_watch', currentEpisode: 0 });

// --- QUERIES (Lấy dữ liệu) ---

// Query 1: Lấy dữ liệu chi tiết phim
const { data: movie, isLoading: isMovieLoading, error: movieError } = useQuery({
  queryKey: ['movie', movieId],
  queryFn: () => cineverseService.getMovieById(movieId.value),
  enabled: computed(() => !!movieId.value),
});

// Query 2: Lấy danh sách reviews
const { data: reviews, isLoading: areReviewsLoading } = useQuery({
  queryKey: ['reviews', movieId],
  queryFn: () => cineverseService.getReviewsForMovie(movieId.value),
  enabled: computed(() => !!movieId.value),
  initialData: [], // Khởi tạo với mảng rỗng để template không bị lỗi
});

// Query 3: Lấy trạng thái trong watchlist
const { data: currentWatchlistItem, isLoading: isWatchlistLoading } = useQuery({
  queryKey: ['watchlistItem', movieId],
  queryFn: () => cineverseService.getWatchlistItem(movieId.value),
  enabled: computed(() => authStore.isAuthenticated && !!movieId.value),
  retry: (failureCount, error) => {
    // Không thử lại nếu lỗi là 404 (không tìm thấy), vì đó là trạng thái hợp lệ
    return error.response?.status !== 404 && failureCount < 2;
  },
});

// --- MUTATIONS (Thay đổi dữ liệu) ---

// Mutation chung cho việc Cập nhật/Thêm/Xóa watchlist
const { mutate: mutateWatchlist, isPending: isUpdatingWatchlist } = useMutation({
  mutationFn: (payload) => {
    if (payload.action === 'delete') {
      return cineverseService.deleteWatchlistItem(payload.movieId);
    }
    return cineverseService.addOrUpdateWatchlistItem(payload.data);
  },
  onSuccess: () => {
    // Làm mới lại query của watchlist item để cập nhật giao diện
    queryClient.invalidateQueries({ queryKey: ['watchlistItem', movieId.value] });
  },
  onError: (err) => alert(`Lỗi: ${err.message}`),
});

// Mutation cho việc tạo, sửa, xóa Review
const { mutate: mutateReview, isPending: isSubmittingReview } = useMutation({
  mutationFn: (payload) => {
    switch (payload.action) {
      case 'create':
        return cineverseService.createReview(movieId.value, payload.data);
      case 'update':
        return cineverseService.updateReview(payload.reviewId, payload.data);
      case 'delete':
        return cineverseService.deleteReview(payload.reviewId);
    }
  },
  onSuccess: () => {
    // Khi review thay đổi, cần làm mới cả list review và thông tin phim (vì rating có thể thay đổi)
    queryClient.invalidateQueries({ queryKey: ['reviews', movieId.value] });
    queryClient.invalidateQueries({ queryKey: ['movie', movieId.value] });
    isWritingReview.value = false;
    editingReviewId.value = null;
  },
  onError: (err) => alert(`Lỗi: ${err.message}`),
});


// --- Handlers (Gọi các mutation) ---
const handleAddToWatchlist = () => mutateWatchlist({
  action: 'addOrUpdate',
  data: { movieId: movieId.value, status: 'plan_to_watch' }
});

const handleUpdateWatchlist = () => mutateWatchlist({
  action: 'addOrUpdate',
  data: { ...watchlistForm.value, movieId: movieId.value }
});

const handleRemoveFromWatchlist = () => {
  if (confirm('Bạn có chắc chắn muốn xóa phim này khỏi danh sách?')) {
    mutateWatchlist({ action: 'delete', movieId: movieId.value });
  }
};

const handleReviewSubmit = (reviewData) => mutateReview({ action: 'create', data: reviewData });
const handleUpdateReviewSubmit = (reviewData) => mutateReview({ action: 'update', reviewId: editingReviewId.value, data: reviewData });
const handleDeleteReview = (reviewId) => {
  if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
    mutateReview({ action: 'delete', reviewId: reviewId });
  }
};


// --- Computed & Watchers ---
const isLoading = computed(() => isMovieLoading.value || areReviewsLoading.value || isWatchlistLoading.value);
const error = computed(() => movieError.value);
const userHasReviewed = computed(() => {
  if (!authStore.isAuthenticated || !reviews.value) return false;
  return reviews.value.some(r => r.user_id === authStore.currentUser.user_id);
});

// Cập nhật form khi dữ liệu watchlist thay đổi
watch(currentWatchlistItem, (item) => {
  if (item) {
    watchlistForm.value.status = item.status;
    watchlistForm.value.currentEpisode = item.current_episode || 0;
  }
});

// Cuộn lên đầu trang khi chuyển trang
watch(movieId, () => window.scrollTo(0, 0));

// --- Utility Functions ---
const formatDuration = (minutes) => {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

const getEmbedUrl = (url) => {
  if (!url) return '';
  try {
    let videoId;
    if (url.includes('youtu.be')) {
      videoId = new URL(url).pathname.slice(1);
    } else {
      videoId = new URL(url).searchParams.get('v');
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {
    console.error("Invalid trailer URL", e);
  }
  return url; // Trả về URL gốc nếu không xử lý được
};

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/300x450/0D0C1D/FFFFFF?text=Not+Found';
};

</script>

<style scoped>
.cineverse-theme {
  background-color: var(--deep-space-black);
  color: var(--nebula-white);
  font-family: 'Be Vietnam Pro', sans-serif;
  min-height: 100vh;
}

.loading-container {
  min-height: 100vh;
}

/* --- Banner Phim --- */
.movie-banner {
  position: relative;
  padding: 6rem 0;
  background-size: cover;
  background-position: center;
}

.banner-overlay {
  position: relative;
  z-index: 1;
  background-color: var(--surface-glass);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 10px;
  padding: 2rem;
}

.movie-poster {
  max-width: 300px;
  margin: 0 auto;
  border: 3px solid var(--border-glass);
}

.rating-badge {
  background-color: var(--starlight-yellow);
  color: var(--deep-space-black);
  font-weight: bold;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
}

.meta-info {
  font-size: 1.1rem;
  color: var(--nebula-white);
}

.genre-badge {
  background-color: var(--surface-glass);
  border: 1px solid var(--border-glass);
  color: var(--nebula-white);
  padding: 0.4em 0.8em;
  font-size: 0.9rem;
}

.synopsis {
  max-width: 600px;
  color: rgba(245, 245, 250, 0.8);
}

.btn-accent {
  background-color: var(--starlight-yellow);
  color: var(--deep-space-black);
  font-weight: bold;
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-accent:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(255, 217, 77, 0.2);
}

/* --- Nội dung chính --- */
.section-title {
  font-weight: 700;
  border-left: 4px solid var(--galaxy-purple);
  padding-left: 1rem;
  margin-bottom: 1.5rem;
}

.glass-sidebar {
  position: sticky;
  top: 100px;
  background: var(--surface-glass);
  backdrop-filter: blur(15px);
  border: 1px solid var(--border-glass);
}

.sidebar-title {
  font-weight: 700;
}

.info-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-glass);
}

.info-list li:last-child {
  border-bottom: none;
}

.info-list li span {
  color: rgba(245, 245, 250, 0.7);
}

/* --- Chỉnh sửa danh sách xem */
.watchlist-edit-form {
  max-width: 550px;
  width: 100%;
}

.watchlist-edit-form .form-label {
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
}

.watchlist-edit-form .btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.9rem;
}

.watchlist-edit-form .btn-sm {
  width: auto;
}

/* --- Khu vực Bình luận & Watchlist Form --- */
.glass-surface,
.review-box,
.watchlist-edit-form {
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
}

.review-item:not(:last-child) {
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 1rem;
}

.watchlist-edit-form h5 {
  color: var(--starlight-yellow);
  font-weight: bold;
}

.custom-select,
.custom-input {
  background-color: rgba(245, 245, 250, 0.08);
  border: 1px solid var(--border-glass);
  color: var(--nebula-white);
}

.custom-select:focus,
.custom-input:focus {
  background-color: rgba(245, 245, 250, 0.15);
  border-color: var(--cosmic-blue);
  box-shadow: 0 0 0 0.25rem rgba(46, 115, 232, 0.25);
  color: var(--nebula-white);
}

.custom-select option {
  background-color: var(--deep-space-black);
  color: var(--nebula-white);
}

.gradient-button {
  background: linear-gradient(90deg, var(--galaxy-purple), var(--cosmic-blue));
  border: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.gradient-button:hover {
  transform: translateY(-2px);
}

.rating-display {
  color: var(--starlight-yellow);
  flex-shrink: 0;
}

.review-actions {
  text-align: right;
}

.btn-link-light,
.btn-link-danger {
  text-decoration: none;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
}

.btn-link-light {
  color: var(--nebula-white);
}

.btn-link-light:hover {
  color: var(--starlight-yellow);
}

.btn-link-danger {
  color: #dc3545;
}

.btn-link-danger:hover {
  color: #ff5b6c;
}
</style>