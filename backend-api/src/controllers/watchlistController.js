const jsend = require("../utils/jsend");
const WatchlistService = require("../services/watchlistService");

const WatchlistController = {
  /**
   * Lấy danh sách xem của người dùng hiện tại, có hỗ trợ bộ lọc.
   */
  getUserWatchlist: async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      const filters = req.query;
      const watchlist = await WatchlistService.getUserWatchlist(
        userId,
        filters
      );

      // Sử dụng hàm tiện ích để trả về phản hồi thành công
      jsend.success(res, watchlist);
    } catch (error) {
      next(error); // Chuyển lỗi đến middleware xử lý lỗi chung
    }
  },

  /**
   * Thêm hoặc cập nhật một mục trong danh sách xem của người dùng.
   */
  addOrUpdateWatchlistItem: async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      const { movieId, status, currentEpisode } = req.body;

      // Kiểm tra các trường bắt buộc
      if (!movieId || !status) {
        return jsend.fail(res, "ID phim và trạng thái là bắt buộc.", 400);
      }

      const item = await WatchlistService.addOrUpdateWatchlistItem(
        userId,
        movieId,
        status,
        currentEpisode
      );

      // Trả về mục đã được thêm/cập nhật
      jsend.success(res, item);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy thông tin một mục cụ thể trong danh sách xem.
   */
  getWatchlistItem: async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      const { movieId } = req.params;
      const item = await WatchlistService.getWatchlistItem(userId, movieId);

      if (!item) {
        // Trả về lỗi "fail" khi không tìm thấy mục
        return jsend.fail(res, "Phim không có trong danh sách xem", 404);
      }

      jsend.success(res, item);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa một mục khỏi danh sách xem của người dùng.
   */
  deleteWatchlistItem: async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      const { movieId } = req.params;
      await WatchlistService.deleteWatchlistItem(userId, movieId);

      // Phản hồi 204 (No Content) là chuẩn cho việc xóa thành công
      // và không cần nội dung trả về.
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = WatchlistController;
