const express = require("express");
const AuthController = require("../controllers/authController");
const { loginLimiter } = require("../middlewares/rateLimitMiddleware");
const { validateRequest } = require("../middlewares/validator");
const { registerSchema, loginSchema } = require("../schemas/auth.schemas");
const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  loginLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

module.exports = router;
