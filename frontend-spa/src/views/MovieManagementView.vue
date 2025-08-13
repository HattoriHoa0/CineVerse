<template>
  <div class="cineverse-theme admin-movie-management-page min-vh-100 py-5">
    <div class="container">
      <h1 class="text-starlight-yellow-glow text-center mb-5">Quản lý Phim & Anime</h1>

      <div v-if="isLoading" class="loading-container d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="error" class="alert alert-danger text-center glassmorphism-card">
        <h4 class="alert-heading">Đã xảy ra lỗi!</h4>
        <p>{{ error }}</p>
        <hr>
        <RouterLink to="/" class="btn btn-primary">Quay về trang chủ</RouterLink>
      </div>

      <div v-else>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <button class="btn gradient-button" @click="openMovieModal('add')">
            <i class="fa-solid fa-plus"></i> Thêm Phim Mới
          </button>
          <div class="input-group w-50">
            <input type="text" class="form-control custom-input" placeholder="Tìm kiếm phim..." v-model="searchQuery"
              @keyup.enter="fetchMovies">
            <button class="btn gradient-button-small" @click="fetchMovies">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>

        <div class="table-responsive glassmorphism-card p-3">
          <table class="table table-dark table-hover table-striped mb-0">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Tiêu đề</th>
                <th scope="col">Loại</th>
                <th scope="col">Năm</th>
                <th scope="col">Đánh giá</th>
                <th scope="col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="movies.length === 0">
                <td colspan="6" class="text-center text-muted py-4">Không tìm thấy phim nào.</td>
              </tr>
              <tr v-for="(movie, index) in movies" :key="movie.movie_id">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <img :src="movie.poster_url" class="rounded me-2" width="50" height="75"
                      @error="handleImageError" />
                    <span>{{ movie.title }}</span>
                  </div>
                </td>
                <td>{{ movie.type }}</td>
                <td>{{ movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A' }}</td>
                <td>{{ movie.average_rating || 'N/A' }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-info me-2 custom-outline-btn"
                    @click="openMovieModal('edit', movie)">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger custom-outline-btn"
                    @click="confirmDelete(movie.movie_id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav v-if="totalPages > 1" aria-label="Page navigation" class="mt-4">
          <ul class="pagination justify-content-center custom-pagination">
            <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Trước</a>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ 'active': currentPage === page }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Sau</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="modal fade" id="movieModal" tabindex="-1" aria-labelledby="movieModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content glassmorphism-card">
          <div class="modal-header border-bottom border-glass">
            <h5 class="modal-title text-starlight-yellow-glow" id="movieModalLabel">
              {{ isEditing ? 'Chỉnh sửa Phim' : 'Thêm Phim Mới' }}
            </h5>
            <button type="button" class="btn-close custom-close-btn" data-bs-dismiss="modal"
              aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmitMovie">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="title" class="form-label text-light">Tiêu đề <span class="text-danger">*</span></label>
                  <input type="text" class="form-control custom-input" id="title" v-model="movieForm.title" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="original_title" class="form-label text-light">Tiêu đề gốc</label>
                  <input type="text" class="form-control custom-input" id="original_title"
                    v-model="movieForm.original_title">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="type" class="form-label text-light">Loại <span class="text-danger">*</span></label>
                  <select class="form-select custom-input text-dark" id="type" v-model="movieForm.type" required>
                    <option value="" disabled>Chọn loại</option>
                    <option value="movie">Phim Điện Ảnh</option>
                    <option value="tv_series">Phim Truyền Hình</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="release_date" class="form-label text-light">Năm phát hành</label>
                  <input type="number" class="form-control custom-input" id="release_date"
                    v-model.number="movieForm.release_date" min="1800" max="2100">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="status" class="form-label text-light">Trạng thái</label>
                  <select class="form-select custom-input text-dark" id="status" v-model="movieForm.status">
                    <option value="released">Đã phát hành</option>
                    <option value="airing">Đang chiếu</option>
                    <option value="upcoming">Sắp ra mắt</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="runtime_minutes" class="form-label text-light">Thời lượng (phút)</label>
                  <input type="number" class="form-control custom-input" id="runtime_minutes"
                    v-model.number="movieForm.runtime_minutes" min="0">
                </div>
                <div class="col-md-6 mb-3">
                  <label for="episode_count" class="form-label text-light">Số tập</label>
                  <input type="number" class="form-control custom-input" id="episode_count"
                    v-model.number="movieForm.episode_count" min="1">
                </div>
                <div class="col-12 mb-3">
                  <label for="poster_url" class="form-label text-light">URL Poster</label>
                  <input type="url" class="form-control custom-input" id="poster_url" v-model="movieForm.poster_url">
                </div>
                <div class="col-12 mb-3">
                  <label for="trailer_url" class="form-label text-light">URL Trailer</label>
                  <input type="url" class="form-control custom-input" id="trailer_url" v-model="movieForm.trailer_url">
                </div>
                <div class="col-12 mb-3">
                  <label for="synopsis" class="form-label text-light">Tóm tắt nội dung</label>
                  <textarea class="form-control custom-input" id="synopsis" v-model="movieForm.synopsis"
                    rows="3"></textarea>
                </div>
                <div class="col-12 mb-3">
                  <label for="genres" class="form-label text-light">Thể loại</label>
                  <select class="form-select custom-input" id="genres" v-model="movieForm.genres" multiple>
                    <option v-for="genre in availableGenres" :key="genre.genre_id" :value="genre.genre_id">{{ genre.name
                    }}</option>
                  </select>
                  <small class="form-text text-light">Giữ Ctrl/Cmd để chọn nhiều thể loại.</small>
                </div>
              </div>
              <div class="modal-footer border-top border-glass mt-4">
                <button type="button" class="btn btn-secondary custom-outline-btn" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn gradient-button" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ isSubmitting ? 'Đang lưu...' : 'Lưu' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="deleteConfirmModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glassmorphism-card">
          <div class="modal-header border-bottom border-glass">
            <h5 class="modal-title text-starlight-yellow-glow">Xác nhận xóa</h5>
            <button type="button" class="btn-close custom-close-btn" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-light">
            Bạn có chắc chắn muốn xóa phim này không? Hành động này không thể hoàn tác.
          </div>
          <div class="modal-footer border-top border-glass">
            <button type="button" class="btn btn-secondary custom-outline-btn" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger gradient-button-danger" @click="deleteMovie"
              :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ isSubmitting ? 'Đang xóa...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import cineverseService from '@/services/cineverse.service';
import { Modal } from 'bootstrap';

// --- Khởi tạo ---
const queryClient = useQueryClient();

// --- State cục bộ cho UI & Form ---
const currentPage = ref(1);
const searchQuery = ref('');
const itemsPerPage = 10;
const isEditing = ref(false);
const movieForm = ref({});
const movieModalInstance = ref(null);
const deleteConfirmModalInstance = ref(null);
const movieIdToDelete = ref(null);

// --- QUERIES (Lấy dữ liệu) ---

// Query 1: Lấy danh sách phim, reactive với trang và thanh tìm kiếm
const { data: movieData, isLoading, error } = useQuery({
  queryKey: ['adminMovies', currentPage, searchQuery],
  queryFn: () => cineverseService.getMoviesAdvanced({
    page: currentPage.value,
    search: searchQuery.value,
    limit: itemsPerPage,
  }),
  // Giữ lại dữ liệu cũ khi đang fetch dữ liệu mới để UI không bị giật
  keepPreviousData: true,
});

// Query 2: Lấy danh sách tất cả thể loại cho form
const { data: availableGenres } = useQuery({
  queryKey: ['allGenres'],
  queryFn: () => cineverseService.getAllGenres(),
  initialData: [],
});

// --- MUTATIONS (Thay đổi dữ liệu) ---

// Mutation cho việc Thêm và Cập nhật phim
const { mutate: saveMovie, isPending: isSubmitting } = useMutation({
  mutationFn: (moviePayload) => {
    if (moviePayload.movie_id) {
      return cineverseService.updateMovie(moviePayload.movie_id, moviePayload);
    }
    return cineverseService.createMovie(moviePayload);
  },
  onSuccess: () => {
    // Vô hiệu hóa và tải lại query 'adminMovies' để cập nhật bảng
    queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
    movieModalInstance.value.hide();
  },
  onError: (err) => alert(`Lỗi: ${err.message}`),
});

// Mutation cho việc Xóa phim
const { mutate: deleteMovieMutation } = useMutation({
  mutationFn: (id) => cineverseService.deleteMovie(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
    deleteConfirmModalInstance.value.hide();
  },
  onError: (err) => alert(`Lỗi: ${err.message}`),
});


// --- Computed Properties từ data của useQuery ---
const movies = computed(() => movieData.value?.movies || []);
const totalPages = computed(() => movieData.value?.pagination?.totalPages || 1);

// --- Handlers (Chỉ gọi các mutation) ---
const handleSubmitMovie = () => {
  const payload = { ...movieForm.value };
  if (payload.release_date) {
    // Chỉ cần gửi năm, backend sẽ xử lý
    payload.release_date = `${payload.release_date}-01-01`;
  }
  saveMovie(payload);
};

const deleteMovie = () => {
  if (movieIdToDelete.value) {
    deleteMovieMutation(movieIdToDelete.value);
  }
};

// --- Lifecycle & Watchers ---
onMounted(() => {
  movieModalInstance.value = new Modal(document.getElementById('movieModal'));
  deleteConfirmModalInstance.value = new Modal(document.getElementById('deleteConfirmModal'));
});

// Reset về trang 1 khi người dùng gõ vào ô tìm kiếm
watch(searchQuery, () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  }
});

// --- Hàm điều khiển Modal ---
// Mở modal và chuẩn bị dữ liệu cho form
const openMovieModal = (mode, movieData = null) => {
  isEditing.value = mode === 'edit';
  if (isEditing.value && movieData) {
    // Chế độ sửa: điền dữ liệu phim vào form
    const genreIds = movieData.genres
      ? availableGenres.value
        .filter(g => movieData.genres.includes(g.name))
        .map(g => g.genre_id)
      : [];
    movieForm.value = {
      ...movieData,
      release_date: movieData.release_date ? new Date(movieData.release_date).getFullYear() : null,
      genres: genreIds
    };
  } else {
    // Chế độ thêm: reset form về trạng thái rỗng
    movieForm.value = {
      title: '', original_title: '', type: '', release_date: null, status: 'released',
      runtime_minutes: null, episode_count: null, poster_url: '', trailer_url: '',
      synopsis: '', genres: [],
    };
  }
  movieModalInstance.value.show();
};

// Mở modal xác nhận xóa
const confirmDelete = (id) => {
  movieIdToDelete.value = id;
  deleteConfirmModalInstance.value.show();
};

// --- Hàm tiện ích ---
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) { currentPage.value = page; }
};

// Xử lý khi ảnh poster bị lỗi
const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/50x75/0D0C1D/F5F5FA?text=N/A';
};

// --- Lifecycle & Watchers ---
onMounted(() => {
  movieModalInstance.value = new Modal(document.getElementById('movieModal'));
  deleteConfirmModalInstance.value = new Modal(document.getElementById('deleteConfirmModal'));
});

// Reset về trang 1 khi người dùng gõ vào ô tìm kiếm
watch(searchQuery, () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  }
});
</script>

<style scoped>
/* Thêm "scoped" để CSS chỉ áp dụng cho component này */
.admin-movie-management-page {
  background-color: var(--deep-space-black);
  background-image: linear-gradient(175deg, rgba(46, 115, 232, 0.1) -10%, rgba(90, 66, 212, 0.15) 40%, var(--deep-space-black) 80%);
}

.text-starlight-yellow-glow {
  margin-top: 50px;
  color: var(--starlight-yellow);
  text-shadow: 0 0 5px rgba(255, 217, 77, 0.7), 0 0 10px rgba(255, 217, 77, 0.5);
}

.glassmorphism-card {
  background: var(--surface-glass);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--border-glass);
  border-radius: 1rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

/* --- Styles cho các nút bấm --- */
.gradient-button,
.gradient-button-small,
.gradient-button-danger {
  border: none;
  color: var(--nebula-white);
  font-weight: bold;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.gradient-button {
  background: linear-gradient(90deg, var(--galaxy-purple), var(--cosmic-blue));
  padding: 0.75rem 1.5rem;
}

.gradient-button:hover {
  background: linear-gradient(90deg, var(--cosmic-blue), var(--galaxy-purple));
  box-shadow: 0 6px 20px rgba(46, 115, 232, 0.4);
  transform: translateY(-2px);
}

.gradient-button-small {
  background: linear-gradient(90deg, var(--galaxy-purple), var(--cosmic-blue));
  padding: 0.5rem 1rem;
  font-size: 0.9em;
}

.gradient-button-small:hover {
  transform: translateY(-1px);
}

.gradient-button-danger {
  background: linear-gradient(90deg, #dc3545, #ff6b6b);
  padding: 0.75rem 1.5rem;
}

.gradient-button-danger:hover {
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
  transform: translateY(-2px);
}

.custom-outline-btn {
  border-color: var(--border-glass);
  color: var(--nebula-white);
  transition: all 0.3s ease;
}

.custom-outline-btn:hover {
  background-color: var(--cosmic-blue);
  border-color: var(--cosmic-blue);
  transform: scale(1.05);
}

/* --- Styles cho Form và Input --- */
.custom-input,
.custom-select {
  background-color: rgba(245, 245, 250, 0.08);
  border: 1px solid var(--border-glass);
  color: var(--nebula-white);
  padding: 0.75rem 1.25rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.custom-input:focus,
.custom-select:focus {
  background-color: rgba(245, 245, 250, 0.15);
  border-color: var(--cosmic-blue);
  box-shadow: 0 0 0 0.25rem rgba(46, 115, 232, 0.25);
  color: var(--nebula-white);
}

.custom-input::placeholder {
  color: rgba(245, 245, 250, 0.6);
}

.custom-select option {
  background-color: var(--deep-space-black);
  color: var(--nebula-white);
}

.custom-close-btn {
  filter: invert(1) grayscale(100%) brightness(200%);
}

/* --- Styles cho Bảng --- */
.table-dark {
  --bs-table-bg: transparent;
  --bs-table-striped-bg: rgba(245, 245, 250, 0.02);
  --bs-table-hover-bg: rgba(245, 245, 250, 0.08);
  --bs-table-color: var(--nebula-white);
  --bs-table-border-color: var(--border-glass);
}

.table thead th {
  color: var(--starlight-yellow);
  font-weight: bold;
}

.table tbody td {
  vertical-align: middle;
}

/* --- Styles cho Phân trang --- */
.custom-pagination .page-item .page-link {
  background-color: var(--surface-glass);
  border: 1px solid var(--border-glass);
  color: var(--nebula-white);
  margin: 0 0.25rem;
  border-radius: 0.5rem;
}

.custom-pagination .page-item.active .page-link {
  background: linear-gradient(90deg, var(--galaxy-purple), var(--cosmic-blue));
  border-color: var(--cosmic-blue);
}

.custom-pagination .page-item.disabled .page-link {
  background-color: rgba(245, 245, 250, 0.02);
  color: rgba(245, 245, 250, 0.4);
}
</style>