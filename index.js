require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");

const router = require("./routes");
const errorMiddleware = require("./middlewares/error-middleware");
const UserModel = require("./models/user-model");
const { adminJs, router: adminRouter } = require("./admin");

mongoose.set("bufferCommands", false);

const app = express();

/* ===================== CORS ===================== */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://waynix.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

/* ===================== MIDDLEWARE ===================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ===================== DB CONNECTION ===================== */
let isDbConnected = false;
let connectPromise = null;

const ensureDefaultAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com")
    .toLowerCase()
    .trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";

  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (existingAdmin) {
    existingAdmin.role = "admin";
    existingAdmin.emailVerified = true;
    await existingAdmin.save();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await UserModel.create({
    name: "Waynix Admin",
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
    isActive: true,
    emailVerified: true,
  });
};

const ensureDb = async () => {
  if (isDbConnected) return;
  if (connectPromise) return connectPromise;
  if (!process.env.DB_URI) throw new Error("DB_URI missing");

  connectPromise = mongoose
    .connect(process.env.DB_URI, {
      dbName: process.env.DB_NAME || "Waynix",
      serverSelectionTimeoutMS: 30000,
    })
    .then(async () => {
      await ensureDefaultAdmin();
      isDbConnected = true;
      console.log("✅ MongoDB connected");
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
};

/* ===================== HEALTH ROUTES ===================== */
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/health-db", async (req, res) => {
  try {
    await ensureDb();
    const ping = await mongoose.connection.db.admin().ping();
    res.json({
      ok: true,
      readyState: mongoose.connection.readyState,
      ping,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      message: e.message,
    });
  }
});

app.get("/api/version", (req, res) => {
  res.json({ version: "waynix-server-v2" });
});

/* Ensure DB before protected/app requests */
app.use(async (req, res, next) => {
  // Allow non-DB diagnostics even when DB is down
  if (
    req.path === "/api/health" ||
    req.path === "/api/version" ||
    req.path === "/api/health-db"
  ) {
    return next();
  }
  try {
    await ensureDb();
    next();
  } catch (e) {
    next(e);
  }
});

/* ===================== ROUTES ===================== */
if (!process.env.VERCEL) {
  app.use(adminJs.options.rootPath, adminRouter);
}
app.use("/api", router);
app.use(errorMiddleware);

/* ===================== EXPORT (CRITICAL) ===================== */
module.exports = app;
