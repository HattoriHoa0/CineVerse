<template>
  <div class="home-main" :style="{ backgroundImage: bannerImage }">
    <div class="cineverse-theme">
      <HeroSlider />
      <main id="content" class="py-5">
        <div class="container">
          <div v-if="isLoading">
            Đang tải...
          </div>
          <div v-else-if="error" class="alert alert-danger">{{ error.message }}</div>

          <div v-else>
            <MovieList title="Thịnh hành trong tuần" :movies="trendingMovies" />
            <MovieList title="Đánh giá cao nhất" :movies="topRatedMovies" />
            <MovieList title="Anime Mới Cập Nhật" :movies="animeMovies" />
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import cineverseService from '@/services/cineverse.service';
import MovieList from '@/components/MovieList.vue';
import HeroSlider from '@/components/HeroSlider.vue';

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

// --- Hàm tiện ích để ánh xạ dữ liệu  ---
const mapApiData = (movie) => ({
  id: movie.movie_id,
  title: movie.title,
  posterUrl: movie.poster_url,
  averageRating: movie.average_rating,
});

// --- Lấy dữ liệu phim bằng TanStack Vue Query ---

// 1. Query để lấy phim thịnh hành
const {
  data: trendingMovies,
  isLoading: isTrendingLoading,
  error: trendingError
} = useQuery({
  queryKey: ['movies', 'trending'],
  queryFn: () => cineverseService.getMovies({ limit: 10, sortBy: 'rating_count' }),
  select: (data) => (Array.isArray(data) ? data.map(mapApiData) : []),
});

// 2. Query để lấy phim đánh giá cao
const {
  data: topRatedMovies,
  isLoading: isTopRatedLoading,
  error: topRatedError
} = useQuery({
  queryKey: ['movies', 'topRated'],
  queryFn: () => cineverseService.getMovies({ limit: 10, sortBy: 'average_rating' }),
  select: (data) => (Array.isArray(data) ? data.map(mapApiData) : []),
});

// 3. Query để lấy Anime mới
const {
  data: animeMovies,
  isLoading: isAnimeLoading,
  error: animeError
} = useQuery({
  queryKey: ['movies', 'anime'],
  queryFn: () => cineverseService.getMovies({ type: 'tv_series', genre_type: 'anime', limit: 10 }),
  select: (data) => (Array.isArray(data) ? data.map(mapApiData) : []),
});

// --- Gộp trạng thái loading và error để dùng trong template ---
const isLoading = computed(() => isTrendingLoading.value || isTopRatedLoading.value || isAnimeLoading.value);
const error = computed(() => trendingError.value || topRatedError.value || animeError.value);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700&display=swap');

.home-main {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-color: inherit;
  padding: 0;
  margin: 0;
}

.cineverse-theme {
  color: var(--nebula-white);
  font-family: 'Be Vietnam Pro', sans-serif;
  min-height: 100vh;
}
</style>