const mongoose = require("mongoose");
const Part = require("./partModel");

// 🧩 Schema cho từng sản phẩm trong đơn hàng
const orderItemSchema = new mongoose.Schema({
  partId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Part",
    required: true,
  },
  name: { type: String },
  price: { type: Number },
  quantity: { type: Number, required: true },
  image: { type: String },
  subtotal: { type: Number },
});

// 🧾 Schema chính cho đơn hàng
const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Đơn hàng phải có ít nhất 1 sản phẩm.",
      },
    },
    totalAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Pending",
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    paymentMethod: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

/* 
  🧮 Tính tổng tiền & tự động gán thông tin phụ tùng
  Chạy trước khi validate hoặc lưu
*/
orderSchema.pre("validate", async function (next) {
  try {
    let total = 0;

    for (const item of this.items) {
      if (item.partId) {
        const part = await Part.findById(item.partId);

        if (!part) {
          throw new Error(`Không tìm thấy phụ tùng với ID: ${item.partId}`);
        }

        // ✅ Gán thông tin từ Part
        item.name = part.name;
        item.price = part.price;
        item.image = part.image;
        item.subtotal = part.price * item.quantity;

        total += item.subtotal;
      }
    }

    this.totalAmount = total;
    next();
  } catch (error) {
    next(error);
  }
});

/*
  🔢 Tự động sinh mã orderId dạng GH0001, GH0002,...
  Chạy trước khi lưu vào DB
*/
orderSchema.pre("save", async function (next) {
  try {
    if (!this.orderId) {
      const lastOrder = await mongoose
        .model("Order")
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

module.exports = mongoose.model("Order", orderSchema);
