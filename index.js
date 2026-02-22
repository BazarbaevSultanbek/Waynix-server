require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");

const router = require("./routes/index");
const { adminJs, router: adminRouter } = require("./admin");
const socket = require("./controllers/socket-controller");
const errorMiddleware = require("./middlewares/error-middleware");
const UserModel = require("./models/user-model");

mongoose.set("bufferCommands", false);

const PORT = process.env.PORT || 8001;
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://waynix.vercel.app",
];

// ---------- Core middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

socket();

// ---------- DB connection ----------
let isDbConnected = false;

const ensureDefaultAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com")
    .toLowerCase()
    .trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";

  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (existingAdmin) {
    existingAdmin.role = "admin";
    existingAdmin.emailVerified = true;
    existingAdmin.newsletterSubscribed = false;
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
    newsletterSubscribed: false,
    bio: "Default system administrator account",
  });

  console.log(`Default admin created: ${adminEmail}`);
};

const ensureDb = async () => {
  if (isDbConnected) return;

  if (!process.env.DB_URI) {
    throw new Error("DB_URI is missing in environment variables");
  }

  console.log("DB ENV CHECK:", {
    hasDbUri: Boolean(process.env.DB_URI),
    dbName: process.env.DB_NAME || "Waynix",
    nodeEnv: process.env.NODE_ENV || null,
    vercelEnv: process.env.VERCEL_ENV || null,
  });

  try {
    await mongoose.connect(process.env.DB_URI, {
      dbName: process.env.DB_NAME || "Waynix",
      serverSelectionTimeoutMS: 30000,
    });

    await ensureDefaultAdmin();

    isDbConnected = true;
    console.log("MongoDB connected");
  } catch (e) {
    console.error("MONGO_CONNECT_ERROR:", e.message);
    throw e;
  }
};

// IMPORTANT: DB connect middleware BEFORE routes
app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (e) {
    next(e);
  }
});

// ---------- Health routes ----------
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "waynix-server" });
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
      readyState: mongoose.connection.readyState,
    });
  }
});

// ---------- App routes ----------
app.use(adminJs.options.rootPath, adminRouter);
app.use("/api", router);

// ---------- Error middleware ----------
app.use(errorMiddleware);

// ---------- Local start ----------
if (!process.env.VERCEL) {
  ensureDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}!`);
      });
    })
    .catch((e) => {
      console.error("Failed to start server:", e);
    });
}

// ---------- Vercel export ----------
module.exports = app;
