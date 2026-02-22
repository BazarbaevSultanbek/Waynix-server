const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone_number: { type: String, default: "" },
  avatar: {
    type: String,
    default: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png",
  },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  joinedAt: { type: Date, default: Date.now },
  socials: {
    instagram: { type: String, default: "" },
    telegram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  visitedPlaces: { type: [String], default: [] },
  savedPlaces: { type: [String], default: [] },
  comments: {
    type: [
      {
        placeId: { type: String, default: "" },
        text: { type: String, default: "" },
        rating: { type: Number, min: 1, max: 5, default: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  settings: {
    language: { type: String, default: "uz" },
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
    fontSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
    notifications: {
      newPlaces: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
    },
  },
  isActive: { type: Boolean, default: true },
  isGit: { type: Boolean, default: false },
  activationLink: { type: String, default: "" },
});

module.exports = model("User", UserSchema);
