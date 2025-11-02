const Moto = require("../models/motoModel");
const Brand = require("../models/brandModel");
const User = require("../models/userModel");

// ✅ Lấy danh sách xe, có populate Brand
exports.getAllMotos = async (req, res) => {
  try {
    const motos = await Moto.find()
      .populate("brandId", "name image")
      .populate("userId", "email roles");
    res.json(motos);
  } catch (err) {
    console.error("Lỗi lấy danh sách moto:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy xe theo biển số (case-insensitive, exact match)
exports.getByLicensePlate = async (req, res) => {
  try {
    const { licensePlate } = req.params;
    if (!licensePlate)
      return res.status(400).json({ message: "Missing licensePlate" });

    // escape regex special chars
    const escaped = licensePlate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const moto = await Moto.findOne({
      licensePlate: { $regex: `^${escaped}$`, $options: "i" },
    })
      .populate("brandId", "name image")
      .populate("userId", "email roles");

    if (!moto)
      return res
        .status(404)
        .json({ message: "Không tìm thấy xe với biển số này" });

    res.json(moto);
  } catch (err) {
    console.error("Lỗi lấy moto theo biển số:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ✅ Tạo xe mới (liên kết brand)
exports.createMoto = async (req, res) => {
  try {
    const { licensePlate, model, year, color, brandId, userId } = req.body;

    // kiểm tra brand có tồn tại không
    const brand = await Brand.findById(brandId);
    if (!brand) return res.status(404).json({ message: "Brand không tồn tại" });

    // kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    const newMoto = new Moto({
      licensePlate,
      model,
      year,
      color,
      brandId: brandId,
      userId: userId,
    });

    await newMoto.save();
    res.status(201).json({ message: "Tạo xe thành công", moto: newMoto });
  } catch (err) {
    console.error("Lỗi tạo moto:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ✅ Cập nhật xe theo biển số
exports.updateMoto = async (req, res) => {
  try {
    const { licensePlate } = req.params;
    const { model, year, color, brandId, userId } = req.body;

    const escaped = licensePlate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const moto = await Moto.findOneAndUpdate(
      { licensePlate: { $regex: `^${escaped}$`, $options: "i" } },
      { model, year, color, brandId, userId },
      { new: true }
    )
      .populate("brandId", "name image")
      .populate("userId", "email roles");

    if (!moto)
      return res.status(404).json({ message: "Không tìm thấy xe để cập nhật" });

    res.status(200).json({ message: "Cập nhật thành công", moto });
  } catch (err) {
    console.error("🔥 Lỗi cập nhật moto:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteMoto = async (req, res) => {
  try {
    const { licensePlate } = req.params;

    if (!licensePlate)
      return res.status(400).json({ message: "Thiếu biển số xe" });

    // escape regex
    const escaped = licensePlate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const moto = await Moto.findOneAndDelete({
      licensePlate: { $regex: `^${escaped}$`, $options: "i" },
    });

    if (!moto)
      return res
        .status(404)
        .json({ message: "Không tìm thấy xe có biển số này" });

    res.status(200).json({ message: "Xóa xe thành công", moto });
  } catch (err) {
    console.error("🔥 Lỗi xóa moto:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};