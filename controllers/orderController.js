const Order = require("../models/orderModel");

// 🟢 Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Kiểm tra dữ liệu
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ message: "Đơn hàng không hợp lệ." });
    }

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({
      message: "Không thể tạo đơn hàng",
      error: error.message,
    });
  }
};

// 🟢 Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      message: "Lấy danh sách đơn hàng thất bại",
      error: error.message,
    });
  }
};

// 🟢 Lấy đơn hàng theo userId
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    const orders = await Order.find({ userId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      message: "Không thể lấy đơn hàng của người dùng",
      error: error.message,
    });
  }
};

// 🟢 Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({
      message: "Không thể lấy đơn hàng theo ID",
      error: error.message,
    });
  }
};

// 🟢 Cập nhật đơn hàng
exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {
      new: true,
      runValidators: true,
    }).populate("userId", "name email");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json({
      message: "Cập nhật đơn hàng thành công",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      message: "Không thể cập nhật đơn hàng",
      error: error.message,
    });
  }
};

// 🟢 Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json({ message: "Xóa đơn hàng thành công" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      message: "Không thể xóa đơn hàng",
      error: error.message,
    });
  }
};
