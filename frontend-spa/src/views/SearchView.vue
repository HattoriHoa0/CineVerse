<template>
  <div class="search-view-container">
    <div class="container py-5">
      <!-- Tiêu đề trang, hiển thị từ khóa tìm kiếm -->
      <h1 class="page-title mb-4">
        Kết quả tìm kiếm cho: <span class="text-starlight-yellow">"{{ searchQuery }}"</span>
      </h1>

      <div class="row g-4">
        <!-- Danh sách kết quả -->
        <div class="col-lg-8">
          <div class="results-list">
            <!-- Trạng thái Loading -->
            <div v-if="isLoading" class="loading-container">
              <div v-for="n in 5" :key="n" class="result-item-placeholder placeholder-glow mb-3">
                <div class="placeholder col-2 me-3" style="width: 80px; height: 120px;"></div>
                <div class="flex-grow-1">
                  <div class="placeholder col-6 mb-2"></div>
                  <div class="placeholder col-4"></div>
                </div>
              </div>
            </div>

            <!-- Trạng thái có kết quả -->
            <div v-else-if="results.length > 0">
              <RouterLink v-for="item in results" :key="item.id" :to="{ name: 'movie.detail', params: { id: item.id } }" class="result-item text-decoration-none">
                <img :src="item.posterUrl" class="item-poster" :alt="item.title" @error="handleImageError">
                <div class="item-details">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <p class="item-meta">{{ item.year }} • {{ item.type }}</p>
                  <p class="item-cast">Diễn viên: {{ item.cast }}</p>
                </div>
              </RouterLink>
            </div>

            <!-- Trạng thái không có kết quả -->
            <div v-else class="text-center p-5 glass-pane">
              <h4 class="text-nebula-white">Không tìm thấy kết quả nào</h4>
              <p class="text-white-50">Vui lòng thử với một từ khóa khác.</p>
            </div>
          </div>
        </div>

        <!-- CBộ lọc -->
        <div class="col-lg-4">
          <aside class="sidebar-filters glass-pane p-4">
            <!-- Lọc theo loại -->
            <div class="filter-group mb-4">
              <h5 class="filter-title">Lọc theo loại</h5>
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-filter" :class="{active: activeFilter === 'all'}" @click="applyFilter('all')">Tất cả</button>
                <button class="btn btn-filter" :class="{active: activeFilter === 'movie'}" @click="applyFilter('movie')">Phim Điện Ảnh</button>
                <button class="btn btn-filter" :class="{active: activeFilter === 'tv_series'}" @click="applyFilter('tv_series')">Phim Truyền Hình</button>
              </div>
            </div>

            <!-- Lọc theo thể loại -->
            <div class="filter-group">
              <h5 class="filter-title">Lọc theo thể loại</h5>
              <div class="d-flex flex-wrap gap-2">
                <button v-for="genre in genres" :key="genre" class="btn btn-filter" :class="{ active: activeGenre === genre }" @click="applyGenreFilter(genre)">
                  {{ genre }}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import cineverseService from '@/services/cineverse.service';

// --- Khởi tạo ---
const route = useRoute();

// --- State cục bộ cho các bộ lọc ---
const searchQuery = ref('');
const activeFilter = ref('all');
const activeGenre = ref(null);

// Danh sách thể loại (có thể được fetch từ API trong tương lai)
const genres = ref([
  "Giả Tượng", "Bí Ẩn", "Hài", "Lãng Mạn", "Khoa Học Viễn Tưởng", "Lịch Sử", "Kinh Dị",
  "Gây Cấn", "Chiến Tranh", "Chính Kịch", "Tài Liệu", "Hoạt Hình", "Gia Đình", "Hình Sự"
]);


// --- QUERY (Lấy dữ liệu) ---
// Một useQuery duy nhất để quản lý tất cả kết quả tìm kiếm
const { data: results, isLoading } = useQuery({
  // queryKey chứa tất cả các state ảnh hưởng đến kết quả
  queryKey: ['searchResults', searchQuery, activeFilter, activeGenre],
  queryFn: () => {
    // Xây dựng params từ các state
    const params = { search: searchQuery.value };
    if (activeFilter.value && activeFilter.value !== 'all') {
      params.type = activeFilter.value;
    }
    if (activeGenre.value) {
      params.genre = activeGenre.value;
    }
    return cineverseService.getMovies(params);
  },
  // Biến đổi dữ liệu trả về từ API
  select: (dataFromApi) => {
    return dataFromApi.map(movie => ({
      id: movie.movie_id,
      title: movie.title,
      year: movie.release_year,
      type: movie.type === 'movie' ? 'Phim Điện Ảnh' : 'Phim Truyền Hình',
      cast: 'Đang cập nhật...', // Giữ nguyên hoặc xử lý thêm nếu API trả về
      posterUrl: movie.poster_url,
    }));
  },
  // Chỉ chạy query khi có từ khóa tìm kiếm
  enabled: computed(() => !!searchQuery.value),
  keepPreviousData: true, // Giữ dữ liệu cũ khi đang fetch, tránh giật màn hình
  initialData: [], // Khởi tạo với mảng rỗng
});


// --- Handlers (Chỉ thay đổi state, không gọi fetch thủ công) ---

const applyFilter = (filterType) => {
  activeFilter.value = filterType;
  // Không cần gọi fetch, useQuery sẽ tự động chạy lại do queryKey thay đổi
};

const applyGenreFilter = (genre) => {
  if (activeGenre.value === genre) {
    activeGenre.value = null; // Bỏ chọn nếu nhấn lại
  } else {
    activeGenre.value = genre;
  }
  // Không cần gọi fetch, useQuery sẽ tự động chạy lại
};

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/80x120/0D0C1D/F5F5FA?text=Cine';
};

// --- Watcher ---
// Chỉ cần một watcher để cập nhật searchQuery từ URL
watch(
  () => route.query.q,
  (newQuery) => {
    searchQuery.value = newQuery || '';
  },
  { immediate: true }
);
</script>

<style scoped>
.search-view-container {
  padding-top: 100px;
  background-color: var(--deep-space-black);
  min-height: 100vh;
  color: var(--nebula-white);
}

.page-title {
  font-weight: 700;
  border-left: 4px solid var(--galaxy-purple);
  padding-left: 1rem;
}

.text-starlight-yellow {
  color: var(--starlight-yellow);
}

.glass-pane {
  background: var(--surface-glass);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--border-glass);
  border-radius: 0.75rem;
}

.result-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-glass);
  transition: background-color 0.3s ease;
  color: inherit;
}
.result-item:hover {
  background-color: var(--surface-glass);
  border-radius: 0.5rem;
}
.result-item:last-child {
  border-bottom: none;
}

.item-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.item-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--nebula-white);
  margin-bottom: 0.25rem;
}

.item-meta {
  color: #adb5bd;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.item-cast {
  font-size: 0.9rem;
  color: #6c757d;
}

.sidebar-filters {
  position: sticky;
  top: 100px; 
}

.filter-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--starlight-yellow);
  margin-bottom: 1rem;
}

.btn-filter {
  background-color: rgba(245, 245, 250, 0.1);
  border: 1px solid var(--border-glass);
  color: var(--nebula-white);
  transition: all 0.3s ease;
}
.btn-filter:hover {
  background-color: var(--galaxy-purple);
  border-color: var(--galaxy-purple);
  color: white;
}
.btn-filter.active {
  background: linear-gradient(90deg, var(--galaxy-purple), var(--cosmic-blue));
  border-color: var(--cosmic-blue);
  color: white;
  font-weight: bold;
}

.result-item-placeholder {
  display: flex;
  align-items: center;
}
</style>
