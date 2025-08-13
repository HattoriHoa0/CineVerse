const jsend = require("../utils/jsend");
const MovieService = require("../services/movieService");

const MovieController = {
  /**
   * Lấy tất cả phim với các bộ lọc cơ bản.
   */
  getAllMovies: async (req, res, next) => {
    try {
      const filters = req.query;
      const movies = await MovieService.getAllMovies(filters);
      // Sử dụng hàm tiện ích để trả về phản hồi thành công
      jsend.success(res, movies);
    } catch (error) {
      next(error); // Chuyển lỗi đến middleware xử lý lỗi chung
    }
  },

  /**
   * Lấy thông tin phim chi tiết theo ID.
   */
  getMovieById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const movie = await MovieService.getMovieById(id);

      if (!movie) {
        // Sử dụng hàm tiện ích để trả về lỗi "fail" khi không tìm thấy
        return jsend.fail(res, "Không tìm thấy phim", 404);
      }

      // Sử dụng hàm tiện ích để trả về dữ liệu phim
      jsend.success(res, movie);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tạo một phim mới (chỉ dành cho quản trị viên).
   */
  createMovie: async (req, res, next) => {
    try {
      const newMovie = await MovieService.createMovie(req.body);
      // Trả về phản hồi tạo thành công với mã trạng thái 201
      jsend.success(res, newMovie, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật thông tin phim theo ID (chỉ dành cho quản trị viên).
   */
  updateMovie: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedMovie = await MovieService.updateMovie(id, req.body);

      if (!updatedMovie) {
        return jsend.fail(res, "Không tìm thấy phim để cập nhật", 404);
      }

      jsend.success(res, updatedMovie);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa một phim theo ID (chỉ dành cho quản trị viên).
   */
  deleteMovie: async (req, res, next) => {
    try {
      const { id } = req.params;
      await MovieService.deleteMovie(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  getAllMoviesAdvanced: async (req, res) => {
    try {
      const {
        type,
        genre_id,
        search,
        release_date,
        status,
        sortBy,
        sortOrder,
        page = 1,
        limit = 10,
      } = req.query;

      const filters = {
        type,
        genre_id: genre_id ? Number(genre_id) : undefined,
        search,
        release_date: release_date ? Number(release_date) : undefined,
        status,
        sortBy,
        sortOrder,
        page: Number(page),
        limit: Number(limit),
      };

      // Fetch movies with filters
      const movies = await MovieService.getAllMovies(filters);

      // Optional: Get total count (for pagination)
      const totalQuery = await MovieService.getAllMovies({
        ...filters,
        page: undefined,
        limit: undefined,
      });
      const total = totalQuery.length;

      jsend.success(res, {
        movies,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phim:", err);
      return res
        .status(500)
        .json({ error: "Đã xảy ra lỗi khi lấy dữ liệu phim." });
    }
  },
};

module.exports = MovieController;
