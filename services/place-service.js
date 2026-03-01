const { v4: uuidv4 } = require("uuid");
const ApiError = require("../exceptions/api-error");
const PlaceModel = require("../models/place-model");
const UserModel = require("../models/user-model");

class PlaceService {
  async submitPlace(ownerId, payload) {
    const {
      name,
      category,
      region,
      district,
      location,
      description,
      phones,
      email,
      workingHours,
      socialLinks,
      images,
      mapUrl,
    } = payload;

    if (!name || !category || !location || !description) {
      throw ApiError.BadRequest(
        "name, category, location and description are required"
      );
    }

    const place = await PlaceModel.create({
      name: String(name).trim(),
      category,
      region: region || "",
      district: district || "",
      location: String(location).trim(),
      description: String(description).trim(),
      phones: Array.isArray(phones) ? phones.filter(Boolean) : [],
      email: email || "",
      workingHours: workingHours || "",
      socialLinks: socialLinks || {},
      images: Array.isArray(images) ? images.filter(Boolean).slice(0, 5) : [],
      mapUrl: mapUrl || "",
      owner: ownerId,
      status: "pending",
    });

    await UserModel.findByIdAndUpdate(ownerId, { $addToSet: { myPlaces: place._id } });

    const admins = await UserModel.find({ role: "admin" }).select("_id notifications");
    const notification = {
      id: uuidv4(),
      title: "New place submitted",
      text: `${place.name} is waiting for review`,
      type: "place_submission",
      meta: { placeId: String(place._id), category: place.category },
      createdAt: new Date(),
    };

    await Promise.all(
      admins.map((admin) =>
        UserModel.findByIdAndUpdate(admin._id, {
          $push: { notifications: notification },
        })
      )
    );

    return place;
  }

  async getApprovedPlaces(category) {
    const query = { status: "approved" };
    if (category) query.category = category;
    return PlaceModel.find(query).sort({ createdAt: -1 }).lean();
  }

  async getMyPlaces(ownerId) {
    return PlaceModel.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
  }

  async getPendingPlaces() {
    return PlaceModel.find({ status: "pending" })
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  async moderatePlace(adminId, placeId, decision, reviewComment) {
    const place = await PlaceModel.findById(placeId);
    if (!place) throw ApiError.BadRequest("Place not found");

    if (!["approved", "rejected"].includes(decision)) {
      throw ApiError.BadRequest("Decision must be approved or rejected");
    }

    place.status = decision;
    place.reviewComment = reviewComment || "";
    place.reviewedAt = new Date();
    place.reviewedBy = adminId;
    await place.save();

    const ownerNotification = {
      id: uuidv4(),
      title: decision === "approved" ? "Place approved" : "Place rejected",
      text:
        decision === "approved"
          ? `${place.name} was approved and published`
          : `${place.name} was rejected`,
      type: "place_review",
      meta: {
        placeId: String(place._id),
        status: decision,
        reviewComment: place.reviewComment,
      },
      createdAt: new Date(),
    };

    await UserModel.findByIdAndUpdate(place.owner, {
      $push: { notifications: ownerNotification },
    });

    return place;
  }
}

module.exports = new PlaceService();

