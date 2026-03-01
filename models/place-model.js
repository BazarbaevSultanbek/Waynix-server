const { Schema, model } = require("mongoose");

const PlaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "tours",
        "shop",
        "cafe",
        "hotels",
        "services",
        "entertainment",
        "medical",
        "government",
        "education",
      ],
    },
    region: { type: String, default: "" },
    district: { type: String, default: "" },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    phones: { type: [String], default: [] },
    email: { type: String, default: "" },
    workingHours: { type: String, default: "" },
    socialLinks: {
      instagram: { type: String, default: "" },
      telegram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    images: { type: [String], default: [] },
    mapUrl: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewComment: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = model("Place", PlaceSchema);

