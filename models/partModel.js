const mongoose = require("mongoose");

const partSchema = new mongoose.Schema(
  {
    // Khóa chính tự động ObjectId
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true, // Giá bán cho khách
    },
    buyPrice: {
      type: Number,
      required: true, // Giá nhập vào
    },
    empPrice: {
      type: Number,
      required: true, // Giá bán cho nhân viên
    },
    unit: {
      type: String,
      required: true, // Đơn vị: cái, bộ, lít,...
      trim: true,
    },
    limitStock: {
      type: Number,
      required: true, // Giới hạn tồn kho tối thiểu
      default: 0,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand", // liên kết với collection Brand
      required: true,
    },
    image: {
      type: String, // URL ảnh
      default: "",
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt, updatedAt
  }
);

module.exports = mongoose.model("Part", partSchema);
