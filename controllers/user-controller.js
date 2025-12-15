const userServices = require("../services/user-service");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/api-error");
const userModel = require("../models/user-model");
// const fileController = require("./file-controller");

class UserController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userServices.login(email, password);
      res.cookie("accessToken", userData.accessToken, {
        maxAge: 15 * 60 * 1000, // 15 min
        httpOnly: false, // allow JS to read it
        secure: true,
        sameSite: "strict",
      });

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 3600 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.cookie("currentUser", JSON.stringify(userData.user), {
        maxAge: 30 * 24 * 3600 * 1000,
        httpOnly: false,
        secure: true,
        sameSite: "strict",
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const tokenData = await userServices.logout(refreshToken);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      return res.json(tokenData);
    } catch (e) {
      next(e);
    }
  }

  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw next(ApiError.BadRequest("Validation error", errors.array()));
      }
      const { name, email, password, phone_number, isGit } = req.body;
      const userData = await userServices.register(
        name,
        email,
        password,
        phone_number,
        isGit
      );
      res.cookie("accessToken", userData.accessToken, {
        maxAge: 15 * 60 * 1000, // 15 min
        httpOnly: false, // allow JS to read it
        secure: true,
        sameSite: "strict",
      });

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 3600 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.cookie("currentUser", JSON.stringify(userData.user), {
        maxAge: 30 * 24 * 3600 * 1000, // 30 days
        httpOnly: false, // ⚠️ change this if you want to access from frontend.
        // httpOnly: true means you CANNOT access it from JavaScript (for security reasons).
        /// If you want to read it in frontend (e.g. document.cookie), set httpOnly: false.
        secure: true, // only send over HTTPS
        sameSite: "strict", // prevents CSRF
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userServices.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 3600 * 1000,
        httpOnly: true,
      });
      res.cookie("currentUser", JSON.stringify(userData.user), {
        maxAge: 30 * 24 * 3600 * 1000,
        httpOnly: false,
        secure: true,
        sameSite: "strict",
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async activate(req, res, next) {
    try {
      const activationLink = await req.params.link;
      await userServices.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  async addAvatar(req, res, next) {
    console.log("req.user:", req.user); // should not be undefined
    console.log("req.file:", req.file); // multer should fill this
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Avatar file is required" });
      }

      const userId = req.user.id;
      const avatarUrl = `/uploads/${req.file.filename}`;

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { avatar: avatarUrl },
        { new: true }
      );

      res.json({ user: updatedUser });
    } catch (e) {
      console.error(e);
      next(e);
    }
  }

  async updateProfile(req, res, next) {
    try {
      console.log("Update profile request body:", req.body);

      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { name, email, phone_number } = req.body;

      // Fetch all other users (for debugging / checking ID matches)
      const otherUsers = await userModel.find({ _id: { $ne: userId } });

      console.log("Current user ID:", userId);
      console.log(
        "Other users IDs:",
        otherUsers.map((u) => u._id.toString())
      );

      // Update the current user using your service
      const updatedUser = await userServices.updateProfile(userId, {
        name,
        email,
        phone_number,
      });

      if (!updatedUser)
        return res.status(400).json({ error: "User not found" });

      // Return a clean user object
      return res.status(200).json({
        user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          phone_number: updatedUser.phone_number,
          avatar: updatedUser.avatar,
        },
      });
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
  async getFriends(req, res, next) {
    try {
      const id = req.query.userId;
      const users = await userServices.getFriends(id);
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
  async friendRequests(req, res, next) {
    try {
      const id = req.query.id;
      const users = await userServices.friendRequests(id);
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
  async getUnfriends(req, res, next) {
    try {
      const id = req.query.id;
      const users = await userServices.getUnfriends(id);
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
  async getFamilliars(req, res, next) {
    try {
      const id = req.query.userId;
      const users = await userServices.getFamilliars(id);
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }

  async friendRequest(req, res, next) {
    try {
      const id = req.query.id;
      const сandidate = req.query.candidate;
      const user = await userServices.friendRequest(id, сandidate);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async cancelFriendRequest(req, res, next) {
    try {
      const id = req.query.id;
      const сandidate = req.query.candidate;
      const user = await userServices.cancelFriendRequest(id, сandidate);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async addToFriend(req, res, next) {
    try {
      const id = req.query.id;
      const сandidate = req.query.candidate;
      const user = await userServices.addToFriend(id, сandidate);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async deleteFriend(req, res, next) {
    try {
      const id = req.query.id;
      const сandidate = req.query.candidate;
      const user = await userServices.deleteFriend(id, сandidate);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async deleteFriendRequest(req, res, next) {
    try {
      const id = req.query.id;
      const сandidate = req.query.candidate;
      const user = await userServices.deleteFriendRequest(id, сandidate);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
