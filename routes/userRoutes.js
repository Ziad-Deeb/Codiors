const express = require("express");

const { authenticateUser, authorize } = require('../middleware');

const {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  getUserAvatar,
} = require("../controllers/userController");

const router = express.Router();

// router.get("/", authenticateUser, authorizePermissions("admin"), getAllUsers);
router.get("/", authenticateUser, authorize(['admin',  'user']), getAllUsers); 

router.get("/profile/:username", getUserProfile);

router.put("/settings/social", authenticateUser, updateUserProfile);

router.post("/avatar", authenticateUser, updateUserAvatar);

router.get("/avatar/:userId", getUserAvatar);

module.exports = router;
