const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getChatHistory,
} = require("../controllers/chatController");

router.post("/send", authenticateToken, sendMessage);
router.get("/history", authenticateToken, getChatHistory);

module.exports = router;
