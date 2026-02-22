const express = require("express");
const userController = require("../controllers/user-controller");
const postsController = require("../controllers/posts-controller");
const commentsController = require("../controllers/comments-controller");
const notificationController = require("../controllers/notification-controller");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = require("../middlewares/admin-middleware");
const upload = require("../middlewares/upload");

const router = express.Router();


const healthRouter = require("./health");

router.use("/", healthRouter);

router.post(
  "/register",
  body("name").trim().isLength({ min: 2, max: 60 }),
  body("email").isEmail(),
  body("password")
    .isLength({ min: 8, max: 64 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/),
  body("phone_number")
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 7, max: 20 }),
  userController.register,
);


router.post(
  "/verify-email",
  body("email").isEmail(),
  body("code").isLength({ min: 4, max: 8 }),
  userController.verifyEmail,
);
router.post(
  "/resend-verification",
  body("email").isEmail(),
  userController.resendVerification,
);

router.put("/update-profile", authMiddleware, userController.updateProfile);
router.post(
  "/change-password",
  authMiddleware,
  body("oldPassword").isLength({ min: 1 }),
  body("newPassword")
    .isLength({ min: 8, max: 64 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/),
  userController.changePassword,
);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/refresh", userController.refresh);
router.post(
  "/add-avatar",
  authMiddleware,
  upload.single("avatar"),
  userController.addAvatar,
);
router.delete("/delete-avatar", authMiddleware, userController.deleteAvatar);

router.get("/users", authMiddleware, userController.getUsers);
router.post(
  "/send-newsletter",
  authMiddleware,
  adminMiddleware,
  userController.sendNewsletter,
);
router.post("/add-post", authMiddleware, postsController.addPost);
router.get("/posts", authMiddleware, postsController.getAllPosts);
router.post("/add-comment", authMiddleware, commentsController.addComment);
router.get("/comments", authMiddleware, commentsController.getAllComments);
router.get(
  "/notifications",
  authMiddleware,
  notificationController.getNotifications,
);
router.post(
  "/delete-notification",
  authMiddleware,
  notificationController.deleteNotification,
);

module.exports = router;
