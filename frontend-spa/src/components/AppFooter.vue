<template>
  <footer class="footer-container py-5">
    <div class="container">
      <div class="row gy-4">

        <!-- Cột 1: Thông tin & Logo -->
        <div class="col-lg-4 col-md-6">
          <div class="d-flex align-items-center mb-3">
            <img src="@/assets/imgs/universe.png" alt="Logo CineVerse" class="footer-logo me-2">
            <h4 class="footer-title mb-0">CineVerse</h4>
          </div>
          <p class="small">
            Cánh cổng đưa bạn đến với vũ trụ điện ảnh bất tận. Khám phá, theo dõi và thảo luận về những bộ phim yêu
            thích.
          </p>
          <p class="small mt-4 mb-0">&copy; 2025 CineVerse. Mọi quyền được bảo lưu.</p>
        </div>

        <!-- Cột 2: Liên kết nhanh -->
        <div class="col-lg-2 col-md-6">
          <h5 class="footer-heading mb-3">Khám phá</h5>
          <ul class="list-unstyled">
            <li><a href="#" class="footer-link">Trang chủ</a></li>
            <li><a href="#" class="footer-link">Phim mới</a></li>
            <li><a href="#" class="footer-link">Anime</a></li>
            <li><a href="#" class="footer-link">Bảng xếp hạng</a></li>
          </ul>
        </div>

        <!-- Cột 3: Pháp lý & Hỗ trợ -->
        <div class="col-lg-3 col-md-6">
          <h5 class="footer-heading mb-3">Hỗ trợ</h5>
          <ul class="list-unstyled">
            <li><a href="#" class="footer-link">Về chúng tôi</a></li>
            <li><a href="#" class="footer-link">Câu hỏi thường gặp (FAQ)</a></li>
            <li><a href="#" class="footer-link">Chính sách bảo mật</a></li>
            <li><a href="#" class="footer-link">Điều khoản dịch vụ</a></li>
          </ul>
        </div>

        <!-- Cột 4: Mạng xã hội -->
        <div class="col-lg-3 col-md-6">
          <h5 class="footer-heading mb-3">Theo dõi chúng tôi</h5>
          <div class="social-icons">
            <a href="#" target="_blank" rel="noopener noreferrer" class="social-icon" title="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" class="social-icon" title="Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" class="social-icon" title="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" class="social-icon" title="YouTube">
              <i class="fab fa-youtube"></i>
            </a>
          </div>
        </div>

      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-container {
  background-color: var(--deep-space-black);
  border-top: 1px solid var(--border-glass);
  color: var(--nebula-white);
}

.footer-logo {
  width: 50px;
  height: 50px;
}

.footer-title {
  font-weight: 700;
  color: #fff;
}

.footer-heading {
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.footer-link {
  color: var(--nebula-white-light);
  text-decoration: none;
  transition: color 0.3s ease, padding-left 0.3s ease;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.footer-link:hover {
  color: var(--starlight-yellow);
  padding-left: 5px;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icon {
  color: var(--nebula-white-light);
  font-size: 1.25rem;
  transition: color 0.3s ease, transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-glass);
  border-radius: 50%;
  text-decoration: none;
}

.social-icon:hover {
  color: var(--starlight-yellow);
  background-color: var(--border-glass);
  transform: translateY(-3px);
}
</style>
