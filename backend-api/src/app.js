const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const genreRoutes = require("./routes/genreRoutes");
const uploadAvatarRoutes = require("./routes/uploadAvatarRoutes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/uploads", express.static("public/uploads"));

// 2. Định nghĩa các routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/watchlists", watchlistRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/", uploadAvatarRoutes);

const swaggerDoc = require("../docs/openapiSpec.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.get("/", (req, res) => {
  res.send("CineVerse Backend API is running!");
});

app.use(errorHandler);

module.exports = app;
