const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/api-error");
const userServices = require("../services/user-service");

const getCookieOptions = (isRefresh = false) => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    maxAge: isRefresh ? 30 * 24 * 3600 * 1000 : 15 * 60 * 1000,
    httpOnly: isRefresh,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };
};

class UserController {
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Validation error", errors.array()));
      }

      const { name, email, password, phone_number, isGit } = req.body;
      const userData = await userServices.register({
        name,
        email,
        password,
        phone_number,
        isGit,
      });

      res.cookie("accessToken", userData.accessToken, getCookieOptions(false));
      res.cookie("refreshToken", userData.refreshToken, getCookieOptions(true));
      res.cookie("currentUser", JSON.stringify(userData.user), {
        ...getCookieOptions(false),
        maxAge: 30 * 24 * 3600 * 1000,
      });
      return res.json({
        ...userData,
        message:
          "Registration successful. Please verify your email with the code sent.",
      });
    } catch (e) {
      next(e);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { email, code } = req.body;
      const user = await userServices.verifyEmailCode(email, code);
      return res.json({ user, message: "Email verified successfully" });
    } catch (e) {
      next(e);
    }
  }

  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      await userServices.resendVerificationCode(email);
      return res.json({ message: "Verification code sent" });
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userServices.login(email, password);

      res.cookie("accessToken", userData.accessToken, getCookieOptions(false));
      res.cookie("refreshToken", userData.refreshToken, getCookieOptions(true));
      res.cookie("currentUser", JSON.stringify(userData.user), {
        ...getCookieOptions(false),
        maxAge: 30 * 24 * 3600 * 1000,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) await userServices.logout(refreshToken);

      res.clearCookie("refreshToken", getCookieOptions(true));
      res.clearCookie("accessToken", getCookieOptions(false));
      res.clearCookie("currentUser", getCookieOptions(false));

      return res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userServices.refresh(refreshToken);

      res.cookie("accessToken", userData.accessToken, getCookieOptions(false));
      res.cookie("refreshToken", userData.refreshToken, getCookieOptions(true));
      res.cookie("currentUser", JSON.stringify(userData.user), {
        ...getCookieOptions(false),
        maxAge: 30 * 24 * 3600 * 1000,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async addAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Avatar file is required" });
      }
      const userId = req.user.id;
      const avatarUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await userServices.addAvatar(userId, avatarUrl);
      res.cookie("currentUser", JSON.stringify(updatedUser), {
        ...getCookieOptions(false),
        maxAge: 30 * 24 * 3600 * 1000,
      });
      return res.json({ user: updatedUser });
    } catch (e) {
      next(e);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const updatedUser = await userServices.updateProfile(userId, req.body);
      res.cookie("currentUser", JSON.stringify(updatedUser), {
        ...getCookieOptions(false),
        maxAge: 30 * 24 * 3600 * 1000,
      });
      return res.json({ user: updatedUser });
    } catch (e) {
      next(e);
    }
  }

  async deleteAvatar(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const updatedUser = await userServices.deleteAvatar(userId);

      res.cookie("currentUser", JSON.stringify(updatedUser), {
        ...getCookieOptions(false),
        maxAge: 30 * 24 * 3600 * 1000,
      });

      return res.json({ user: updatedUser });
    } catch (e) {
      next(e);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const { oldPassword, newPassword } = req.body;
      await userServices.changePassword(userId, oldPassword, newPassword);
      return res.json({ message: "Password changed successfully" });
    } catch (e) {
      next(e);
    }
  }

  async sendNewsletter(req, res, next) {
    try {
      const { subject, content } = req.body;
      const count = await userServices.sendNewsletter(subject, content);
      return res.json({ message: "Newsletter sent", count });
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const id = req.query.id;
      const users = await userServices.getAllUsers(id);
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
