const RepairOrder = require("../models/repairOrderModel");
const User = require("../models/userModel");
const Part = require("../models/partModel"); // Đảm bảo đã import model Part
const Moto = require("../models/motoModel");

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

    // Kiểm tra customer đã đăng ký xe bên moto chưa
    const moto = await Moto.findOne({ userId: customerId });
    if (!moto) {
      return res
        .status(400)
        .json({ message: "Khách hàng này chưa đăng ký xe. Vui lòng đăng ký xe trước khi tạo phiếu sửa chữa." });
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

exports.getRepairOrders = async (req, res) => {
  try {
    // Nếu bạn muốn lọc theo role
    const user = req.user;

    let filter = {};
    // Nếu là nhân viên, chỉ xem các phiếu do họ tạo
    if (user.roles.includes("employee")) {
      filter.employeeId = user.userId;
    }
    // Nếu là admin thì thấy tất cả

    const orders = await RepairOrder.find(filter)
      .populate("customerId", "fullName email phone")
      .populate("employeeId", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách phiếu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phiếu",
      error: error.message,
    });
  }
};

// Lấy phiếu sửa chữa theo ID
exports.getRepairOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await RepairOrder.findById(id)
      .populate("customerId", "fullName email phone")
      .populate("employeeId", "fullName email phone")
      .populate({
        path: "items.partId",
        populate: { path: "brandId", select: "name" }
      });
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy phiếu sửa chữa" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Sửa phiếu sửa chữa
exports.updateRepairOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerId,
      items,
      repairCosts,
      notes,
      paymentMethod,
      status,
    } = req.body;

    const order = await RepairOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy phiếu sửa chữa" });
    }

    // Nếu có thay đổi customerId, kiểm tra customer đã đăng ký xe chưa
    if (customerId && customerId.toString() !== order.customerId.toString()) {
      const customer = await User.findById(customerId);
      if (!customer || !customer.roles?.some((r) => r.toLowerCase() === "user")) {
        return res
          .status(400)
          .json({ message: "User này không phải khách hàng" });
      }

      const moto = await Moto.findOne({ userId: customerId });
      if (!moto) {
        return res
          .status(400)
          .json({ message: "Khách hàng này chưa đăng ký xe. Vui lòng đăng ký xe trước khi cập nhật phiếu sửa chữa." });
      }
    }

    // Xác định trạng thái trước và sau
    const prevStatus = order.status;
    const nextStatus = status !== undefined ? status : prevStatus;

    // Nếu chuyển từ khác Completed sang Completed => Trừ kho
    if (nextStatus === "Completed" && prevStatus !== "Completed") {
      for (const item of items) {
        await Part.findByIdAndUpdate(
          item.partId,
          { $inc: { quantity: -Math.abs(item.quantity) } }
        );
      }
    }

    // Nếu chuyển từ Completed về trạng thái khác => Cộng lại kho
    if (prevStatus === "Completed" && nextStatus !== "Completed") {
      for (const item of items) {
        await Part.findByIdAndUpdate(
          item.partId,
          { $inc: { quantity: Math.abs(item.quantity) } }
        );
      }
    }

    // Cập nhật các trường cho phép sửa
    if (customerId) order.customerId = customerId;
    if (items) order.items = items;
    if (repairCosts !== undefined) order.repairCosts = repairCosts;
    if (notes !== undefined) order.notes = notes;
    if (paymentMethod !== undefined) order.paymentMethod = paymentMethod;
    if (status !== undefined) order.status = status;

    await order.save();

    // Populate lại thông tin
    const updatedOrder = await RepairOrder.findById(id)
      .populate("customerId", "fullName email phone")
      .populate("employeeId", "fullName email phone")
      .populate({
        path: "items.partId",
        populate: { path: "brandId", select: "name" }
      });

    res.status(200).json({ success: true, message: "Cập nhật thành công", data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Lấy danh sách customers đã đăng ký xe (để hiển thị trong form tạo/sửa repair order)
exports.getCustomersWithMotos = async (req, res) => {
  try {
    // Lấy danh sách userId từ bảng Moto (những user đã đăng ký xe)
    const userIds = await Moto.distinct("userId");
    
    // Nếu không có user nào đăng ký xe
    if (!userIds || userIds.length === 0) {
      return res.status(200).json([]);
    }
    
    // Lấy thông tin users từ danh sách userId đó và filter theo role "user"
    const customers = await User.find({
      _id: { $in: userIds },
      roles: { $in: ["user"] }
    }).select("fullName phoneNumber email roles _id");

    res.status(200).json(customers);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách customers đã đăng ký xe:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};