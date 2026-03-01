const placeService = require("../services/place-service");

class PlaceController {
  async submit(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const uploadedFiles = Array.isArray(req.files) ? req.files : [];
      const uploadedImages = uploadedFiles.map((file) => `/uploads/${file.filename}`);
      const bodyImages = Array.isArray(req.body.images)
        ? req.body.images
        : req.body.images
          ? [req.body.images]
          : [];

      const phones = Array.isArray(req.body.phones)
        ? req.body.phones
        : req.body.phones
          ? [req.body.phones]
          : [];

      const payload = {
        ...req.body,
        phones,
        images: [...uploadedImages, ...bodyImages],
        socialLinks: {
          instagram: req.body.instagram || "",
          telegram: req.body.telegram || "",
          facebook: req.body.facebook || "",
          website: req.body.website || "",
        },
      };

      const place = await placeService.submitPlace(userId, payload);
      return res.status(201).json({
        message: "Place submitted. Waiting for admin approval.",
        place,
      });
    } catch (e) {
      return next(e);
    }
  }

  async getApproved(req, res, next) {
    try {
      const { category } = req.query;
      const places = await placeService.getApprovedPlaces(category);
      return res.json(places);
    } catch (e) {
      return next(e);
    }
  }

  async getMine(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const places = await placeService.getMyPlaces(userId);
      return res.json(places);
    } catch (e) {
      return next(e);
    }
  }

  async getPending(req, res, next) {
    try {
      const places = await placeService.getPendingPlaces();
      return res.json(places);
    } catch (e) {
      return next(e);
    }
  }

  async moderate(req, res, next) {
    try {
      const adminId = req.user?.id;
      if (!adminId) return res.status(401).json({ error: "Unauthorized" });
      const { id } = req.params;
      const { decision, reviewComment } = req.body;
      const place = await placeService.moderatePlace(
        adminId,
        id,
        decision,
        reviewComment
      );
      return res.json({ message: `Place ${decision}`, place });
    } catch (e) {
      return next(e);
    }
  }
}

module.exports = new PlaceController();

