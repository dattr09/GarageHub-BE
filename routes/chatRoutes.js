const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Lấy tất cả các cuộc hội thoại (chỉ admin)
router.get("/conversations", authenticateToken, authorizeRoles(["admin"]), chatController.getAllConversations);

// Lấy lịch sử chat của một conversation
router.get("/messages/:conversationId", authenticateToken, chatController.getMessages);

// Gửi tin nhắn (REST API backup)
router.post("/messages", authenticateToken, chatController.sendMessage);

// Đánh dấu tin nhắn đã đọc
router.put("/messages/:conversationId/read", authenticateToken, chatController.markAsRead);

// Lấy số lượng tin nhắn chưa đọc
router.get("/unread-count", authenticateToken, chatController.getUnreadCount);

module.exports = router;