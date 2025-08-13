const GenreService = require("../services/genreService");
const jsend = require("../utils/jsend");

const GenreController = {
  getAllGenres: async (req, res, next) => {
    try {
      const genres = await GenreService.getAllGenres();
      jsend.success(res, genres);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = GenreController;
