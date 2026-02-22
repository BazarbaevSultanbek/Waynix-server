const bcrypt = require("bcrypt");
const uuid = require("uuid");
const UserModel = require("../models/user-model");
const UserDto = require("../dtos/user-dto");
const tokenServices = require("./token-service");
const ApiError = require("../exceptions/api-error");
const mailService = require("./mail-service");

const WEAK_PASSWORDS = new Set([
  "123456",
  "12345678",
  "qwerty",
  "password",
  "admin",
  "111111",
  "000000",
]);

function isStrongPassword(password) {
  if (typeof password !== "string") return false;
  if (password.length < 8) return false;
  if (WEAK_PASSWORDS.has(password.toLowerCase())) return false;
  return /[A-Za-z]/.test(password) && /\d/.test(password);
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

class UserService {
  async register(payload) {
    const { name, email, password, phone_number, isGit } = payload;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!name || !normalizedEmail || !password) {
      throw ApiError.BadRequest("Name, email and password are required!");
    }
    if (!isStrongPassword(password)) {
      throw ApiError.BadRequest(
        "Password is too simple. Use at least 8 characters with letters and numbers."
      );
    }

    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw ApiError.BadRequest("A user with this email address already exists!");
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const activationLink = uuid.v4();
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      password: hashpassword,
      phone_number: phone_number || "",
      isGit: Boolean(isGit),
      activationLink,
      joinedAt: new Date(),
      emailVerified: false,
      verificationCode,
      verificationCodeExpiresAt,
    });

    await mailService.sendVerificationCode(normalizedEmail, verificationCode);

    const userDto = new UserDto(user);
    const tokens = tokenServices.generateTokens({ ...userDto });
    await tokenServices.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async verifyEmailCode(email, code) {
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) throw ApiError.BadRequest("User not found");
    if (!user.verificationCode || !user.verificationCodeExpiresAt) {
      throw ApiError.BadRequest("Verification code not found");
    }
    if (new Date() > new Date(user.verificationCodeExpiresAt)) {
      throw ApiError.BadRequest("Verification code expired");
    }
    if (String(user.verificationCode) !== String(code || "")) {
      throw ApiError.BadRequest("Verification code is incorrect");
    }

    user.emailVerified = true;
    user.verificationCode = "";
    user.verificationCodeExpiresAt = null;
    await user.save();
    return new UserDto(user);
  }

  async resendVerificationCode(email) {
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) throw ApiError.BadRequest("User not found");
    if (user.emailVerified) {
      throw ApiError.BadRequest("Email is already verified");
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await mailService.sendVerificationCode(normalizedEmail, verificationCode);
    return true;
  }

  async login(email, password) {
    if (!email || !password) {
      throw ApiError.BadRequest("Email and password are required!");
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw ApiError.BadRequest("User not found!");
    }
    if (!user.emailVerified) {
      throw ApiError.BadRequest("Please verify your email first");
    }

    const isPasswordEquals = await bcrypt.compare(password, user.password);
    if (!isPasswordEquals) {
      throw ApiError.BadRequest("Incorrect password!");
    }

    const userDto = new UserDto(user);
    const tokens = tokenServices.generateTokens({ ...userDto });
    await tokenServices.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    return tokenServices.removeToken(refreshToken);
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = await tokenServices.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenServices.findToken(refreshToken);
    if (!userData || !tokenFromDB) {
      throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenServices.generateTokens({ ...userDto });
    await tokenServices.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async addAvatar(id, pathToFile) {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { avatar: pathToFile },
      { new: true }
    );
    return new UserDto(updatedUser);
  }

  async updateProfile(id, data) {
    const allowed = {
      name: data.name,
      email: data.email ? String(data.email).toLowerCase().trim() : undefined,
      phone_number: data.phone_number,
      bio: data.bio,
      location: data.location,
      socials: data.socials,
      settings: data.settings
        ? {
            language: data.settings.language,
            fontSize: data.settings.fontSize,
            notifications: data.settings.notifications,
          }
        : undefined,
    };

    Object.keys(allowed).forEach((key) => {
      if (allowed[key] === undefined) delete allowed[key];
    });

    if (allowed.email) {
      const exists = await UserModel.findOne({
        email: allowed.email,
        _id: { $ne: id },
      });
      if (exists) throw ApiError.BadRequest("Email already in use");
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, allowed, {
      new: true,
    });
    return new UserDto(updatedUser);
  }

  async changePassword(id, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw ApiError.BadRequest("Old password and new password are required");
    }
    if (!isStrongPassword(newPassword)) {
      throw ApiError.BadRequest(
        "New password is too simple. Use at least 8 characters with letters and numbers."
      );
    }

    const user = await UserModel.findById(id);
    if (!user) throw ApiError.BadRequest("User not found");

    const isValidOld = await bcrypt.compare(oldPassword, user.password);
    if (!isValidOld) {
      throw ApiError.BadRequest("Old password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return true;
  }

  async sendNewsletter(subject, content) {
    if (!subject || !content) {
      throw ApiError.BadRequest("Subject and content are required");
    }
    const users = await UserModel.find({
      newsletterSubscribed: true,
      emailVerified: true,
    }).select("email");

    for (const user of users) {
      await mailService.sendNewsEmail(user.email, subject, content);
    }
    return users.length;
  }

  async getAllUsers(id) {
    return UserModel.find({ _id: { $ne: id } });
  }
}

module.exports = new UserService();
