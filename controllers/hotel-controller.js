const hotelService = require("../services/hotel-service");

class HotelController {
  async getHotels(req, res, next) {
    try {
      const hotels = await hotelService.getAll();
      return res.json(hotels);
    } catch (e) {
      next(e);
    }
  }

  async createHotel(req, res, next) {
    console.log("🔥 createHotel HIT");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    try {
      const { name, description, location, rating, price, phone } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const hotel = await hotelService.create({
        name,
        description,
        location,
        rating: Number(rating),
        price: Number(price),
        phone,
        image: `/uploads/${req.file.filename}`,
      });

      res.status(201).json(hotel);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new HotelController();
