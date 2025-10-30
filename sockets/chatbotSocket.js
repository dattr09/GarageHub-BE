const chatbotService = require('../services/chatbotService');

// Lưu trữ thông tin các phiên chat
const activeSessions = new Map();

const initializeChatbotSocket = (io) => {
  // Tạo namespace riêng cho chatbot
  const chatbotNamespace = io.of('/chatbot');

  chatbotNamespace.on('connection', (socket) => {
    console.log(`🤖 Chatbot client connected: ${socket.id}`);

    // Khởi tạo phiên chat mới
    activeSessions.set(socket.id, {
      userId: socket.handshake.query.userId || 'anonymous',
      startTime: new Date(),
      messageCount: 0
    });

    // Gửi tin nhắn chào mừng
    socket.emit('bot-message', {
      message: 'Xin chào! Tôi là trợ lý ảo của GarageHub. Tôi có thể giúp gì cho bạn? 😊',
      timestamp: new Date(),
      type: 'greeting'
    });

    // Gửi gợi ý câu hỏi
    socket.emit('suggestions', {
      suggestions: chatbotService.getSuggestions(),
      timestamp: new Date()
    });

    // Xử lý tin nhắn từ client
    socket.on('user-message', (data) => {
      console.log(`📩 Message from ${socket.id}:`, data.message);

      const session = activeSessions.get(socket.id);
      if (session) {
        session.messageCount++;
      }

      // Emit typing indicator
      socket.emit('bot-typing', { isTyping: true });

      // Simulate processing delay (500-1500ms)
      const delay = Math.floor(Math.random() * 1000) + 500;

      setTimeout(() => {
        // Xử lý tin nhắn và lấy response
        const response = chatbotService.processMessage(data.message);

        // Stop typing indicator
        socket.emit('bot-typing', { isTyping: false });

        // Gửi response về client
        socket.emit('bot-message', {
          message: response.message,
          category: response.category,
          timestamp: response.timestamp,
          type: 'response'
        });

        // Log để debug
        console.log(`🤖 Bot response to ${socket.id}:`, response.message);
      }, delay);
    });

    // Xử lý yêu cầu thông tin nhanh
    socket.on('quick-info', (data) => {
      const info = chatbotService.getQuickInfo(data.type);
      
      if (info) {
        socket.emit('bot-message', {
          message: `**${info.title}**\n\n${info.items.join('\n')}`,
          timestamp: new Date(),
          type: 'quick-info',
          category: data.type
        });
      }
    });

    // Xử lý yêu cầu gợi ý mới
    socket.on('get-suggestions', () => {
      socket.emit('suggestions', {
        suggestions: chatbotService.getSuggestions(),
        timestamp: new Date()
      });
    });

    // Xử lý đánh giá chatbot
    socket.on('feedback', (data) => {
      console.log(`⭐ Feedback from ${socket.id}:`, data);
      
      socket.emit('bot-message', {
        message: 'Cảm ơn bạn đã đánh giá! Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ. 💙',
        timestamp: new Date(),
        type: 'feedback-response'
      });
    });

    // Xử lý khi client ngắt kết nối
    socket.on('disconnect', () => {
      const session = activeSessions.get(socket.id);
      if (session) {
        const duration = new Date() - session.startTime;
        console.log(`👋 Chatbot client disconnected: ${socket.id}`);
        console.log(`   Session duration: ${Math.round(duration / 1000)}s`);
        console.log(`   Messages exchanged: ${session.messageCount}`);
        activeSessions.delete(socket.id);
      }
    });

    // Xử lý lỗi
    socket.on('error', (error) => {
      console.error(`❌ Socket error from ${socket.id}:`, error);
    });
  });

  // API để lấy thống kê chatbot
  return {
    getActiveSessionsCount: () => activeSessions.size,
    getSessionInfo: (socketId) => activeSessions.get(socketId),
    getAllSessions: () => Array.from(activeSessions.entries())
  };
};

module.exports = initializeChatbotSocket;
