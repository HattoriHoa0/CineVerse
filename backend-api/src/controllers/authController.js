const AuthService = require("../services/authService");
const jsend = require("../utils/jsend");

const AuthController = {
  register: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      const { user, token } = await AuthService.register(
        username,
        email,
        password
      );

      jsend.success(
        res,
        {
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          token,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const { user, token } = await AuthService.login(email, password);
      jsend.success(res, {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = AuthController;
