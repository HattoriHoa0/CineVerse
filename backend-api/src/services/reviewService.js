const db = require("../db");

const ReviewService = {
  getReviewsByMovie: async (movieId) => {
    return db("reviews")
      .join("users", "reviews.user_id", "=", "users.user_id")
      .where("reviews.movie_id", movieId)
      .select("reviews.*", "users.username", "users.avatar_url");
  },

  createReview: async (userId, movieId, rating, comment) => {
    return db.transaction(async (trx) => {
      const existingReview = await trx("reviews")
        .where({ user_id: userId, movie_id: movieId })
        .first();

      if (existingReview) {
        throw new ApiError(409, "Bạn đã đánh giá phim này rồi.");
      }

      const [newReview] = await trx("reviews")
        .insert({
          user_id: userId,
          movie_id: movieId,
          rating,
          comment,
        })
        .returning("*");

      await ReviewService._updateMovieRating(movieId, trx);

      return newReview;
    });
  },

  updateReview: async (reviewId, userId, updateData) => {
    return db.transaction(async (trx) => {
      const review = await trx("reviews")
        .where({ review_id: reviewId })
        .first();
      if (!review) {
        throw new ApiError(404, "Không tìm thấy đánh giá.");
      }
      if (review.user_id !== userId) {
        throw new ApiError(
          403,
          "Bạn chỉ có thể cập nhật đánh giá của chính mình."
        );
      }

      const [updatedReview] = await trx("reviews")
        .where({ review_id: reviewId })
        .update(updateData)
        .returning("*");

      await ReviewService._updateMovieRating(review.movie_id, trx);

      return updatedReview;
    });
  },

  deleteReview: async (reviewId, user) => {
    return db.transaction(async (trx) => {
      const review = await trx("reviews")
        .where({ review_id: reviewId })
        .first();
      if (!review) {
        throw new ApiError(404, "Không tìm thấy đánh giá.");
      }
      if (review.user_id !== user.user_id && user.role !== "admin") {
        throw new ApiError(403, "Bạn không có quyền xóa đánh giá này.");
      }

      await trx("reviews").where({ review_id: reviewId }).del();
      await ReviewService._updateMovieRating(review.movie_id, trx);

      return { message: "Đã xóa đánh giá thành công." };
    });
  },

  /**
   * @param {string} movieId
   * @param {object} trx
   */
  _updateMovieRating: async (movieId, trx) => {
    const stats = await trx("reviews")
      .where("movie_id", movieId)
      .first(
        db.raw("CAST(COUNT(*) AS INTEGER) as count"),
        db.raw("CAST(SUM(rating) AS REAL) as sum")
      );

    const ratingCount = stats.count || 0;
    const ratingSum = stats.sum || 0;

    const averageRating =
      ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : 0.0;

    return trx("movies")
      .where("movie_id", movieId)
      .update({
        average_rating: parseFloat(averageRating),
        rating_count: ratingCount,
      });
  },
};

module.exports = ReviewService;
