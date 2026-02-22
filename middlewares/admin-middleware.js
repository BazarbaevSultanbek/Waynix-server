const ApiError = require("../exceptions/api-error");

module.exports = function (req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(ApiError.UnauthorizedError());
  }
  return next();
};
