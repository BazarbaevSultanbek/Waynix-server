const router = require("express").Router();
const multer = require("multer");
const hotelController = require("../controllers/hotel-controller");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), hotelController.createHotel);
router.get("/", hotelController.getHotels);

module.exports = router;
