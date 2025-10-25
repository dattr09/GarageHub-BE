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
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/verify", verifyCode);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/check", authCheck);
router.put("/change-password", authenticateToken, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
module.exports = router;

/*
#                         _ooOoo_
#                        o8888888o
#                        88" . "88
#                        (| -_- |)
#                        O\  =  /O
#                     ____/`---'\____
#                   .'  \\|     |//  `.
#                  /  \\|||  :  |||//  \
#                 /  _||||| -:- |||||_  \
#                 |   | \\\  -  /'| |   |
#                 | \_|  `\`---'//  |_/ |
#                 \  .-\__ `-. -'__/-.  /
#               ___`. .'  /--.--\  `. .'___
#            ."" '<  `.___\_<|>_/___.' _> \"".
#           | | :  `- \`. ;`. _/; .'/ /  .' ; |
#           \  \ `-.   \_\_`. _.'_/_/  -' _.' /
#             `-.`___`-.__\ \___  /__.-'_.'_.-'
#                         `=--=-'    
#           ___  _   _   _      __  __  //\  _   _ 
#          / _ \| | | | / \    |  \/  ||/_\|| \ | |
#         | | | | | | |/ _ \   | |\/| |/ _ \|  \| |
#         | |_| | |_| / ___ \  | |  | | |_| | |\  |
#          \__\_\\___/_/   \_\ |_|  |_|\___/|_| \_|
# */
