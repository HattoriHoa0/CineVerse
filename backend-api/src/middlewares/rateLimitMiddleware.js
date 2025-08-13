const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message:
    "Too many login attempts from this IP, please try again after minutes",
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({ message: options.message });
  },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again after an hour",
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({ message: options.message });
  },
});

module.exports = { loginLimiter, apiLimiter };
