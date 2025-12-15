const Hotel = require("../models/hotel-model");

class HotelService {
  async getAll() {
    return Hotel.find();
  }

  async create(data) {
    return Hotel.create(data);
  }
}

module.exports = new HotelService();
