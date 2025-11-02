const mongoose = require("mongoose");
const Part = require("./partModel");

// Schema cho từng sản phẩm trong đơn hàng/phiếu
const orderItemSchema = new mongoose.Schema({
  partId: { type: mongoose.Schema.Types.ObjectId, ref: "Part", required: true },
  name: { type: String },
  price: { type: Number },
  quantity: { type: Number, required: true },
  image: { type: String },
  subtotal: { type: Number },
});

// Schema chính cho phiếu sửa chữa
const repairOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    // Khách hàng
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Nhân viên sửa
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Phiếu sửa chữa phải có ít nhất 1 sản phẩm.",
      },
    },
    totalAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: { type: String },
    notes: { type: String },
    repairCosts: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Tự tính tổng tiền và gán thông tin sản phẩm
repairOrderSchema.pre("validate", async function (next) {
  try {
    let total = 0;

    for (const item of this.items) {
      if (item.partId) {
        const part = await Part.findById(item.partId);
        if (!part)
          throw new Error(`Không tìm thấy phụ tùng với ID: ${item.partId}`);

        item.name = part.name;
        item.price = part.price;
        item.image = part.image;
        item.subtotal = part.price * item.quantity;

        total += item.subtotal;
      }
    }

    this.totalAmount = total + this.repairCosts;
    next();
  } catch (error) {
    next(error);
  }
});

// Tạo mã phiếu tự động
repairOrderSchema.pre("save", async function (next) {
  try {
    if (!this.orderId) {
      const lastOrder = await mongoose
        .model("RepairOrder")
        .findOne()
        .sort({ createdAt: -1 });
      let newNumber = 1;
      if (lastOrder && lastOrder.orderId) {
        const match = lastOrder.orderId.match(/GH(\d+)/);
        if (match) newNumber = parseInt(match[1]) + 1;
      }
      this.orderId = `GH${String(newNumber).padStart(4, "0")}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("RepairOrder", repairOrderSchema);
