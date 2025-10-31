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
      error: error.message,
    });
  }
};
