const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const tokenServices = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");
const uuid = require("uuid");

class UserService {
  async register(payload) {
    const { name, email, password, phone_number, isGit } = payload;
    const normalizedEmail = String(email).toLowerCase().trim();
    if (!name || !email || !password) {
      throw ApiError.BadRequest("Name, email and password are required!");
    }
    const candidat = await UserModel.findOne({ email: normalizedEmail });
    if (candidat) {
      throw ApiError.BadRequest(
        "A user with this email address already exists!"
      );
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const activationLink = uuid.v4();
    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      password: hashpassword,
      phone_number: phone_number || "",
      isGit: Boolean(isGit),
      activationLink,
      joinedAt: new Date(),
    });

    const userDto = new UserDto(user);
    const tokens = tokenServices.generateTokens({ ...userDto });
    await tokenServices.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Not corrected link!");
    }

    user.isActive = true;
    await user.save();
  }

  async login(email, password) {
    if (!email || !password) {
      throw ApiError.BadRequest("Email and password are required!");
    }
    const user = await UserModel.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      throw ApiError.BadRequest("User not found!");
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
    const tokenData = await tokenServices.removeToken(refreshToken);
    return tokenData;
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
      { new: true } // return the updated document
    );
    return new UserDto(updatedUser);
  }

  async updateProfile(id, data) {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async getUser(id) {
    const user = await UserModel.findOne({ _id: id });
    return user;
  }
  async getAllUsers(id) {
    const users = await UserModel.find({ _id: { $ne: id } });
    return users;
  }
  async getFriends(id) {
    const user = await UserModel.findOne({ _id: id });
    const friendIds = user.friends;
    let friends = await UserModel.find({ _id: { $in: friendIds } });
    friends = friends.map((friend) => new UserDto(friend));
    return friends;
  }
  async friendRequests(id) {
    const user = await UserModel.findOne({ _id: id });
    const requests = user.requests;
    let userRequests = await UserModel.find({ _id: { $in: requests } });
    userRequests = userRequests.map((users) => new UserDto(users));
    return userRequests;
  }
  async getUnfriends(id) {
    const user = await UserModel.findOne({ _id: id });
    let unfriends = await UserModel.find({ _id: { $ne: id } });
    unfriends = unfriends.filter((item) => !user.friends.includes(item._id));
    unfriends = unfriends.filter((item) => !user.waiting.includes(item._id));
    unfriends = unfriends.map((unfriend) => new UserDto(unfriend));
    return unfriends;
  }
  async getFamilliars(id) {
    const user = await UserModel.findOne({ _id: id });
    const friends = await UserModel.find({ _id: { $in: user.friends } });
    let unfriends = await UserModel.find({ _id: { $ne: id } });
    unfriends = unfriends.filter((item) => !user.friends.includes(item._id));
    unfriends = unfriends.filter((item) => !user.requests.includes(item._id));
    let arr = [];
    friends.forEach((friend) => {
      friend.friends.forEach((item) => {
        arr.push(item);
      });
    });
    let set = new Set(arr);
    return unfriends
      .filter((user) => Array.from(set).includes(user._id.toString()))
      .map((unfriend) => new UserDto(unfriend));
  }

  async friendRequest(id, candidate) {
    await UserModel.findByIdAndUpdate(
      id,
      { $push: { waiting: candidate } },
      { new: true }
    );
    return await UserModel.findByIdAndUpdate(
      candidate,
      { $push: { requests: id } },
      { new: true }
    );
  }

  async cancelFriendRequest(id, candidate) {
    await UserModel.findByIdAndUpdate(
      id,
      { $pull: { wait: candidate } },
      { new: true }
    );
    return await UserModel.findByIdAndUpdate(
      candidate,
      { $pull: { requests: id } },
      { new: true }
    );
  }

  async deleteFriend(id, candidate) {
    await UserModel.findByIdAndUpdate(
      id,
      { $pull: { friend: candidate } },
      { new: true }
    );
    return await UserModel.findByIdAndUpdate(
      candidate,
      { $pull: { friend: id } },
      { new: true }
    );
  }

  async addToFriend(id, candidate) {
    await UserModel.findByIdAndUpdate(
      id,
      { $pull: { requests: candidate } },
      { new: true }
    );
    await UserModel.findByIdAndUpdate(
      id,
      { $push: { friends: candidate } },
      { new: true }
    );
    await UserModel.findByIdAndUpdate(
      candidate,
      { $pull: { waiting: id } },
      { new: true }
    );
    await UserModel.findByIdAndUpdate(
      candidate,
      { $push: { friends: id } },
      { new: true }
    );
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $push: { friends: candidate } },
      { new: true }
    );
    return user;
  }

  async deleteFriendRequest(id, candidate) {
    await UserModel.findByIdAndUpdate(
      candidate,
      { $pull: { wait: id } },
      { new: true }
    );
    return await UserModel.findByIdAndUpdate(
      id,
      { $pull: { requests: candidate } },
      { new: true }
    );
  }
}

module.exports = new UserService();
