const UserService = require("../services/userService");
const jsend = require("../utils/jsend");

const UserController = {
  getMe: async (req, res, next) => {
    try {
      const user = await UserService.getUserProfile(req.user.user_id);
      jsend.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const user = await UserService.getUserProfile(req.params.id);
      jsend.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  updateMe: async (req, res, next) => {
    try {
      const updatedUser = await UserService.updateUserProfile(
        req.user.user_id,
        req.body
      );
      jsend.success(res, updatedUser);
    } catch (error) {
      next(error);
    }
  },

  updateUserById: async (req, res, next) => {
    try {
      const updatedUser = await UserService.updateUserProfile(
        req.params.id,
        req.body
      );
      jsend.success(res, updatedUser);
    } catch (error) {
      next(error);
    }
  },

  deleteMe: async (req, res, next) => {
    try {
      await UserService.deleteUser(req.user.user_id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  deleteUserById: async (req, res, next) => {
    try {
      await UserService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = UserController;
