// Lưu trữ thông tin socket của các user
const userSockets = new Map(); // userId -> socket

const initializeOrderSocket = (io) => {
  const orderNamespace = io.of("/orders");

  orderNamespace.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (!userId) {
      console.log("❌ Order socket: No userId provided, disconnecting");
      socket.disconnect();
      return;
    }

    console.log(`📦 Order socket: User ${userId} connected: ${socket.id}`);

    // Lưu socket của user
    userSockets.set(userId, socket);

    // Join vào room riêng của user để nhận thông báo đơn hàng
    socket.join(`user-${userId}`);

    // Xử lý disconnect
    socket.on("disconnect", () => {
      console.log(`📦 Order socket: User ${userId} disconnected: ${socket.id}`);
      userSockets.delete(userId);
    });
  });

  // Hàm để emit cập nhật trạng thái đơn hàng đến user
  const emitOrderStatusUpdate = (userId, order) => {
    console.log(`📦 Emitting order-status-update to user ${userId}`);
    orderNamespace.to(`user-${userId}`).emit("order-status-update", {
      orderId: order._id,
      status: order.status,
      order: order,
    });
  };

  return {
    emitOrderStatusUpdate,
    getActiveUsersCount: () => userSockets.size,
  };
};

module.exports = initializeOrderSocket;
