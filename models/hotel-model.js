const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    phone: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
