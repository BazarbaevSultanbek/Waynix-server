const Router = require("express").Router;
const mongoose = require("mongoose");

const router = new Router();

router.get("/health-db", async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    return res.json({
      status: "ok",
      db: state === 1 ? "connected" : "disconnected",
    });
  } catch (e) {
    res.status(500).json({ status: "error" });
  }
});

module.exports = router;