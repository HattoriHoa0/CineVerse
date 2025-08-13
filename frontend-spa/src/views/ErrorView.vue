<template>
  <div class="error-view-container min-vh-100 d-flex align-items-center justify-content-center">
    <div class="text-center glassmorphism-card p-5">
      <h1 class="display-1 text-starlight-yellow-glow mb-3">404</h1>
      <p class="lead text-nebula-white-light mb-4">Oops! The page you're looking for doesn't exist.</p>
      <RouterLink to="/" class="btn gradient-button">
        <i class="fa-solid fa-house me-2"></i>Go back to Home
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.error-view-container {
  background: linear-gradient(135deg, #0d0c1d, #1f1c3a);
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}
</style>