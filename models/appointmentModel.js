const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Vui lòng nhập họ tên"],
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
    },
    email: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Vui lòng chọn ngày"],
    },
    time: {
      type: String,
      required: [true, "Vui lòng chọn giờ"],
    },
    vehicleType: {
      type: String,
      enum: ["xe số", "tay ga", "xe côn"],
      required: [true, "Vui lòng chọn loại xe"],
    },
    services: {
      type: [String],
      required: [true, "Vui lòng chọn ít nhất một dịch vụ"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Vui lòng chọn ít nhất một dịch vụ",
      },
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Chờ xác nhận", "Đã xác nhận", "Đang sửa", "Hoàn thành", "Hủy"],
      default: "Chờ xác nhận",
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh theo ngày, giờ và status
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ phone: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);

