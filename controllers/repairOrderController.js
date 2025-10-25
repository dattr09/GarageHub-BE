const RepairOrder = require("../models/repairOrderModel");
const User = require("../models/userModel");

// Controller tạo phiếu sửa chữa
exports.createRepairOrder = async (req, res) => {
  try {
    const user = req.user; // từ token decode

    // Chỉ nhân viên hoặc admin mới tạo phiếu
    if (
      !user.roles?.some((r) => ["employee", "admin"].includes(r.toLowerCase()))
    ) {
      return res.status(403).json({ message: "Không có quyền tạo phiếu" });
    }

    const {
      customerId,
      items,
      repairCosts = 0,
      notes,
      paymentMethod,
    } = req.body;

    // Validate cơ bản
    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ message: "Dữ liệu phiếu không hợp lệ" });
    }

    // Kiểm tra customerId có tồn tại và là khách hàng
    const customer = await User.findById(customerId);
    if (!customer || !customer.roles?.some((r) => r.toLowerCase() === "user")) {
      return res
        .status(400)
        .json({ message: "User này không phải khách hàng" });
    }

    // Tính tổng tiền tự động
    const totalAmount =
      items.reduce((sum, i) => sum + (i.subtotal || i.price * i.quantity), 0) +
      repairCosts;

    // Tạo order mới
    const newOrder = new RepairOrder({
      userId: user.userId, // người tạo phiếu
      customerId,
      employeeId: user.userId, // nhân viên thực hiện
      items,
      repairCosts,
      totalAmount,
      notes,
      paymentMethod,
      orderId: "GH" + Date.now(), // có thể đổi logic tạo mã order
    });

    const savedOrder = await newOrder.save();

    // Populate thông tin customer và employee trước khi trả về
    const populatedOrder = await RepairOrder.findById(savedOrder._id)
      .populate("customerId", "name roles")
      .populate("employeeId", "name roles");

    res
      .status(201)
      .json({ message: "Tạo phiếu thành công", order: populatedOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "Tạo phiếu thất bại", error: error.message });
  }
};
