const Moto = require('../models/motoModel');

// Lấy tất cả xe máy
exports.getAll = async () => {
  return await Moto.find();
};

// Lấy xe máy theo biển số
exports.getByLicensePlate = async (licensePlate) => {
  return await Moto.findOne({ licensePlate });
};

// Lấy danh sách xe theo ID khách hàng
exports.getByCustomerId = async (customerId) => {
  return await Moto.find({ customerId });
};

// Tạo xe mới
exports.create = async (motoData) => {
  const moto = new Moto(motoData);
  return await moto.save();
};

// Cập nhật thông tin xe
exports.update = async (licensePlate, motoData) => {
  return await Moto.findOneAndUpdate({ licensePlate }, motoData, { new: true });
};

// Xóa xe
exports.delete = async (licensePlate) => {
  return await Moto.findOneAndDelete({ licensePlate });
};
