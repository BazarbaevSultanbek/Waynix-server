 const express = require("express");
const userController = require("../controllers/user-controller");
const postsController = require("../controllers/posts-controller");
const commentsController = require("../controllers/comments-controller");
const notificationController = require("../controllers/notification-controller");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");
const upload = require("../middlewares/upload");

const router = express.Router(); 

router.post(
  "/register",
  body("name").trim().isLength({ min: 2, max: 60 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6, max: 64 }),
  body("phone_number").optional({ nullable: true, checkFalsy: true }).isLength({ min: 7, max: 20 }),
  userController.register
);



router.put("/update-profile", authMiddleware, userController.updateProfile);
router.post(
  "/change-password",
  authMiddleware,
  body("oldPassword").isLength({ min: 1 }),
  body("newPassword").isLength({ min: 6, max: 64 }),
  userController.changePassword
);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activate);
router.get("/refresh", userController.refresh);
router.post("/add-avatar", authMiddleware, upload.single("avatar"), userController.addAvatar);
router.get("/users", authMiddleware, userController.getUsers);
router.get("/friends", authMiddleware, userController.getFriends);
router.get("/friend-requests", authMiddleware, userController.friendRequests);
router.get("/unfriends", authMiddleware, userController.getUnfriends);
router.get("/familliars", authMiddleware, userController.getFamilliars);
router.post("/add-post", authMiddleware, postsController.addPost);
router.get("/posts", authMiddleware, postsController.getAllPosts);
router.post("/add-comment", authMiddleware, commentsController.addComment);
router.get("/comments", authMiddleware, commentsController.getAllComments);
router.get("/notifications", authMiddleware, notificationController.getNotifications);
router.post("/delete-notification", authMiddleware, notificationController.deleteNotification);
router.post("/friend-request", authMiddleware, userController.friendRequest);
router.post("/add-to-friend", authMiddleware, userController.addToFriend);
router.post("/delete-friend", authMiddleware, userController.deleteFriend);
router.post("/cancel-friend-request", authMiddleware, userController.cancelFriendRequest);
router.post("/delete-friend-request", authMiddleware, userController.deleteFriendRequest);


module.exports = router;

