const express = require("express");
const router = express.Router();
const {
  register,
  verifyCode,
  loginUser,
  logout,
  authCheck,
  changePassword,
  verifyOtp,
  resetPassword,
  forgotPassword,
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/verify", verifyCode);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/check", authCheck);
router.put("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
module.exports = router;
