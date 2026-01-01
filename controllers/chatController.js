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
        const user = await User.findById(conv.senderId).select("username fullName email phone avatar");
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
      .populate("senderId", "username fullName email avatar");

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
      "username fullName email avatar"
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
    const isAdmin = req.user.roles && req.user.roles.includes("admin");

    // Admin đánh dấu tin nhắn từ user là đã đọc
    // User đánh dấu tin nhắn từ admin là đã đọc
    const senderRoleToMark = isAdmin ? "user" : "admin";

    await Message.updateMany(
      {
        conversationId,
        senderRole: senderRoleToMark,
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

// Upload ảnh chat lên Cloudinary
const uploadChatImages = async (req, res) => {
  try {
    const { uploadToCloudinary } = require("../services/cloudinary/upload");

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có file nào được upload",
      });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, "message")
    );

    const results = await Promise.all(uploadPromises);
    const urls = results.map((result) => result.secure_url);

    res.status(200).json({
      success: true,
      urls,
      message: `Đã upload ${urls.length} ảnh thành công`,
    });
  } catch (error) {
    console.error("Error uploading chat images:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi upload ảnh",
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
  uploadChatImages,
};