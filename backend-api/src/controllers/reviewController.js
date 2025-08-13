const ReviewService = require("../services/reviewService");
const jsend = require("../utils/jsend");

const ReviewController = {
  getReviewsForMovie: async (req, res, next) => {
    try {
      const { movieId } = req.params;
      const reviews = await ReviewService.getReviewsByMovie(movieId);
      jsend.success(res, reviews);
    } catch (error) {
      next(error);
    }
  },

  createReview: async (req, res, next) => {
    try {
      const { movieId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.user_id;

      const newReview = await ReviewService.createReview(
        userId,
        movieId,
        rating,
        comment
      );
      jsend.success(res, newReview, 201);
    } catch (error) {
      next(error);
    }
  },

  updateReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user.user_id;
      const updateData = req.body;

      const updatedReview = await ReviewService.updateReview(
        reviewId,
        userId,
        updateData
      );
      jsend.success(res, updatedReview);
    } catch (error) {
      next(error);
    }
  },

  deleteReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const user = req.user;

      await ReviewService.deleteReview(reviewId, user);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ReviewController;
