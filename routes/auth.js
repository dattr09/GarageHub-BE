const express = require("express");
const router = express.Router();
const {
  register,
  loginUser,
  logout,
  authCheck,
  verifyCode,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/auth-check", authCheck);
router.post("/verify-code", verifyCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
