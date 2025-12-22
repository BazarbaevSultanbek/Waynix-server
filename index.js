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

app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://waynix.vercel.app",
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  // 🔥 THIS IS THE KEY
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});


app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 👇 VERY IMPORTANT
app.options("*", cors());



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
