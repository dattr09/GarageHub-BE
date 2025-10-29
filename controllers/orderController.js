const Order = require("../models/orderModel");
const { sendOrderConfirmationEmail } = require("../utils/confirmmail");
const Part = require("../models/partModel"); // Đảm bảo model Part được import

// 🟢 Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod, notes, email } = req.body;

    if (!userId || !items || items.length === 0 || !email) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ! Đơn hàng phải có userId, email và ít nhất một sản phẩm." });
    }

    // Tạo đơn hàng mới
    const newOrder = new Order({
      userId,
      items: items.map((item) => ({
        partId: item.id,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod,
      notes,
    });

    await newOrder.save();

    // Giảm số lượng linh kiện
    for (const item of items) {
      const part = await Part.findById(item.id);
      if (!part) {
        return res.status(404).json({ message: `Không tìm thấy linh kiện với ID: ${item.id}` });
      }

      part.quantity -= item.quantity;
      if (part.quantity < 0) {
        return res.status(400).json({ message: `Số lượng linh kiện ${part.name} không đủ!` });
      }

      await part.save();
    }

    // Lấy thông tin chi tiết sản phẩm từ cơ sở dữ liệu
    const detailedItems = await Promise.all(
      items.map(async (item) => {
        const part = await Part.findById(item.id).populate("brandId", "name");
        if (!part) {
          throw new Error(`Không tìm thấy sản phẩm với ID: ${item.id}`);
        }
        return {
          name: part.name,
          brand: part.brandId ? part.brandId.name : "Không xác định",
          price: part.price,
          quantity: item.quantity,
        };
      })
    );

    // Gửi email xác nhận đơn hàng
    const confirmationLink = `${process.env.BACKEND_URL}/api/v1/orders/confirm-order/${newOrder._id}`;
    await sendOrderConfirmationEmail({
      to: email,
      orderId: newOrder.orderId,
      totalAmount: newOrder.totalAmount,
      confirmationLink,
      items: detailedItems,
    });

    res.status(201).json({
      message: "Đơn hàng được tạo thành công! Email xác nhận đã được gửi.",
      orderId: newOrder.orderId,
      totalAmount: newOrder.totalAmount,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
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
    const userId = req.params.userId;
    const orders = await Order.find({ userId })
      .populate({
        path: "items.partId",
        select: "name price brandId",
        populate: {
          path: "brandId",
          model: "Brand",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
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

// 🟢 Xác nhận đơn hàng
exports.confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Tìm đơn hàng theo ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
    }

    // Kiểm tra trạng thái đơn hàng trước khi cập nhật
    if (order.status === "Completed") {
      return res.status(400).json({ message: "Đơn hàng đã được xác nhận trước đó!" });
    }

    // Cập nhật trạng thái đơn hàng
    order.status = "Completed";
    order.updatedAt = new Date(); // Cập nhật thời gian chỉnh sửa
    await order.save();

    res.status(200).json({
      message: "Đơn hàng đã được xác nhận thành công!",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi xác nhận đơn hàng:", error);
    res.status(500).json({
      message: "Lỗi server! Không thể xác nhận đơn hàng.",
      error: error.message,
    });
  }
};
