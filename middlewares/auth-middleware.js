const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    let token;

    // 1️⃣ Try cookie first (PRIMARY)
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // 2️⃣ Fallback to Authorization header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = userData;

    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};