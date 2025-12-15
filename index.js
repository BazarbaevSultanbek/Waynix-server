require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");

const router = require("./routes/index");
const { adminJs, router: adminRouter } = require("./admin");
const socket = require("./controllers/socket-controller");
const errorMiddleware = require("./middlewares/error-middleware");
const hotelRoutes = require("./routes/hotelRoutes");

const PORT = process.env.PORT || 8001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

socket();

app.use(adminJs.options.rootPath, adminRouter);
app.use("/api", router);
app.use("/api/hotels", hotelRoutes);

app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      dbName: process.env.DB_NAME,
    });

    app.listen(PORT, () =>
      console.log(`Server started on port ${PORT}!`)
    );
  } catch (e) {
    console.error("Failed to start server:", e);
  }
};

start();
