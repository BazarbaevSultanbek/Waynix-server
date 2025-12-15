const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isGit: { type: Boolean, default: false },
  activationLink: { type: String },
  avatar: { type: String },
  avatarId: { type: String },
  likedPlaces: { type: [String], default: [] },
  visitedPlaces: { type: [String], default: [] },
  bookedPlaces: { type: [String], default: [] }
});

module.exports = model("User", UserSchema);
