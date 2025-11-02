const Message = require("../models/messageModel");
const User = require("../models/userModel");

// Lưu trữ thông tin socket của các user
const userSockets = new Map(); // userId -> socketId
const adminSockets = new Map(); // socketId -> socket (for admins)

const initializeChatSocket = (io) => {
  const chatNamespace = io.of("/chat");

  chatNamespace.on("connection", (socket) => {
    console.log(`💬 Chat client connected: ${socket.id}`);

    const userId = socket.handshake.query.userId;
    const isAdmin = socket.handshake.query.isAdmin === "true";

    if (!userId) {
      console.log("❌ No userId provided, disconnecting");
      socket.disconnect();
      return;
    }

    // Lưu thông tin socket
    if (isAdmin) {
      adminSockets.set(socket.id, socket);
      console.log(`👨‍💼 Admin connected: ${socket.id}`);
    } else {
      userSockets.set(userId, socket.id);
      console.log(`👤 User ${userId} connected: ${socket.id}`);
    }

    // Join vào room của conversation
    const conversationId = userId; // Mỗi user có một conversation với admin
    socket.join(conversationId);

    // Admin join vào tất cả các room để nhận tin nhắn
    if (isAdmin) {
      socket.join("admin-room");
      console.log(`✅ Admin ${userId} joined admin-room`);
    }

    // Gửi tin nhắn từ user/admin
    socket.on("send-message", async (data) => {
      try {
        const { conversationId, message, attachments } = data;

        console.log(`📤 Sending message from ${isAdmin ? 'admin' : 'user'} ${userId}`);
        console.log(`   conversationId: ${conversationId}`);
        console.log(`   message: ${message}`);

        // Tạo tin nhắn mới trong database
        const newMessage = await Message.create({
          conversationId,
          senderId: userId,
          senderRole: isAdmin ? "admin" : "user",
          message,
          attachments: attachments || [],
        });

        // Populate thông tin người gửi
        const populatedMessage = await Message.findById(newMessage._id).populate(
          "senderId",
          "username email avatar"
        );

        // Gửi tin nhắn đến người nhận
        if (isAdmin) {
          // Admin gửi -> gửi đến user trong conversation đó
          console.log(`   → Sending to user conversation: ${conversationId}`);
          chatNamespace.to(conversationId).emit("receive-message", populatedMessage);
        } else {
          // User gửi -> gửi đến tất cả admin
          console.log(`   → Broadcasting to admin-room`);
          console.log(`   → Active admins: ${adminSockets.size}`);
          chatNamespace.to("admin-room").emit("receive-message", populatedMessage);
          // Gửi lại cho chính user (để đồng bộ nếu user mở nhiều tab)
          socket.emit("receive-message", populatedMessage);
        }

        console.log(
          `📨 Message sent from ${isAdmin ? "admin" : "user"} ${userId} in conversation ${conversationId}`
        );
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", {
          message: "Không thể gửi tin nhắn",
          error: error.message,
        });
      }
    });

    // Đánh dấu tin nhắn đã đọc
    socket.on("mark-as-read", async (data) => {
      try {
        const { conversationId } = data;

        await Message.updateMany(
          {
            conversationId,
            senderRole: isAdmin ? "user" : "admin",
            isRead: false,
          },
          { isRead: true }
        );

        // Thông báo cho người kia biết tin nhắn đã được đọc
        if (isAdmin) {
          chatNamespace.to(conversationId).emit("messages-read", { conversationId });
        } else {
          chatNamespace.to("admin-room").emit("messages-read", { conversationId });
        }

        console.log(`✅ Messages marked as read in conversation ${conversationId}`);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // User đang typing
    socket.on("typing", (data) => {
      const { conversationId, isTyping } = data;

      if (isAdmin) {
        // Admin typing -> gửi đến user
        chatNamespace.to(conversationId).emit("user-typing", {
          conversationId,
          isTyping,
          userRole: "admin",
        });
      } else {
        // User typing -> gửi đến admin
        chatNamespace.to("admin-room").emit("user-typing", {
          conversationId,
          isTyping,
          userRole: "user",
        });
      }
    });

    // Admin join vào conversation cụ thể để xem
    socket.on("join-conversation", (data) => {
      if (isAdmin) {
        const { conversationId } = data;
        socket.join(conversationId);
        console.log(`👨‍💼 Admin joined conversation: ${conversationId}`);
      }
    });

    // Admin leave conversation
    socket.on("leave-conversation", (data) => {
      if (isAdmin) {
        const { conversationId } = data;
        socket.leave(conversationId);
        console.log(`👨‍💼 Admin left conversation: ${conversationId}`);
      }
    });

    // Xử lý disconnect
    socket.on("disconnect", () => {
      console.log(`💬 Chat client disconnected: ${socket.id}`);

      if (isAdmin) {
        adminSockets.delete(socket.id);
        console.log(`👨‍💼 Admin disconnected: ${socket.id}`);
      } else {
        userSockets.delete(userId);
        console.log(`👤 User ${userId} disconnected`);
      }
    });
  });

  // Return stats function
  return {
    getActiveUsersCount: () => userSockets.size,
    getActiveAdminsCount: () => adminSockets.size,
    getOnlineUsers: () => Array.from(userSockets.keys()),
  };
};

module.exports = initializeChatSocket;
