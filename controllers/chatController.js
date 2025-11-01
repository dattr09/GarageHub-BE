const Chat = require("../models/chatModel");
const { generateChatResponse } = require("../services/geminiService");

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tin nhắn không được để trống",
      });
    }

    console.log("Processing chat request for user:", userId);

    // Tìm hoặc tạo cuộc trò chuyện cho user
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    // Thêm tin nhắn của user
    chat.messages.push({
      content: message,
      role: "user",
    });

    try {
      // Lấy phản hồi từ Gemini
      const aiResponse = await generateChatResponse(message);
      console.log(
        "Received AI response:",
        aiResponse?.substring(0, 100) + "..."
      );

      // Thêm phản hồi của AI
      chat.messages.push({
        content: aiResponse,
        role: "assistant",
      });

      await chat.save();

      res.json({
        success: true,
        response: aiResponse,
        chatId: chat._id,
      });
    } catch (aiError) {
      console.error("AI Service Error:", aiError);

      // Lưu lại tin nhắn user dù AI lỗi
      await chat.save();

      res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý với AI",
        error: aiError.message,
      });
    }
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý tin nhắn",
const Message = require("../models/messageModel");
const User = require("../models/userModel");

// Lấy tất cả các cuộc hội thoại (dành cho admin)
const getAllConversations = async (req, res) => {
  try {
    // Lấy danh sách conversation ID duy nhất
    const conversations = await Message.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$message" },
          lastMessageTime: { $first: "$createdAt" },
          senderId: { $first: "$senderId" },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $eq: ["$senderRole", "user"] }] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    // Populate thông tin user
    const conversationsWithUser = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv.senderId).select("username email phone avatar");
        return {
          conversationId: conv._id,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount,
          user: user,
        };
      })
    );

    res.status(200).json({
      success: true,
      conversations: conversationsWithUser,
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách cuộc trò chuyện",
      error: error.message,
    });
  }
};

// Lấy lịch sử chat của một conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("senderId", "username email avatar");

    // Đánh dấu tin nhắn đã đọc nếu user là admin
    if (req.user && req.user.roles && req.user.roles.includes("admin")) {
      await Message.updateMany(
        {
          conversationId,
          senderRole: "user",
          isRead: false,
        },
        { isRead: true }
      );
    }

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy tin nhắn",
      error: error.message,
    });
  }
};

// Gửi tin nhắn (REST API - backup nếu websocket không dùng được)
const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, attachments } = req.body;
    const senderId = req.user.userId;
    const senderRole = req.user.roles && req.user.roles.includes("admin") ? "admin" : "user";

    const newMessage = await Message.create({
      conversationId,
      senderId,
      senderRole,
      message,
      attachments: attachments || [],
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "username email avatar"
    );

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi tin nhắn",
      error: error.message,
    });
  }
};

// Đánh dấu tin nhắn đã đọc
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversationId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "Đã đánh dấu tin nhắn là đã đọc",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đánh dấu tin nhắn",
      error: error.message,
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chat = await Chat.findOne({ userId });

    res.json({
      success: true,
      history: chat ? chat.messages : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy lịch sử chat",
// Lấy số lượng tin nhắn chưa đọc
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isAdmin = req.user.roles && req.user.roles.includes("admin");

    let unreadCount;

    if (isAdmin) {
      // Admin: đếm tất cả tin nhắn chưa đọc từ user
      unreadCount = await Message.countDocuments({
        senderRole: "user",
        isRead: false,
      });
    } else {
      // User: đếm tin nhắn chưa đọc từ admin trong conversation của họ
      const conversationId = userId.toString();
      unreadCount = await Message.countDocuments({
        conversationId,
        senderRole: "admin",
        isRead: false,
      });
    }

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy số tin nhắn chưa đọc",
      error: error.message,
    });
  }
};

module.exports = {
  getAllConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
};
