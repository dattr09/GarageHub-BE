const Moto = require("../models/motoModel");
const Brand = require("../models/brandModel");
const User = require("../models/userModel");

// ✅ Lấy danh sách xe, có populate Brand
exports.getAllMotos = async (req, res) => {
  try {
    const motos = await Moto.find()
      .populate("brand", "name image") // chỉ lấy name, image của Brand
      .populate("owner", "email roles"); // lấy email và roles của User
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
      .populate("brand", "name image")
      .populate("owner", "email roles");

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

// ✅ Cập nhật xe
exports.updateMoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { model, year, color, brandId } = req.body;

    const moto = await Moto.findByIdAndUpdate(
      id,
      { model, year, color, brand: brandId },
      { new: true }
    );

    if (!moto) return res.status(404).json({ message: "Không tìm thấy xe" });

    res.json({ message: "Cập nhật thành công", moto });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Xóa xe
exports.deleteMoto = async (req, res) => {
  try {
    const { id } = req.params;
    const moto = await Moto.findByIdAndDelete(id);

    if (!moto) return res.status(404).json({ message: "Không tìm thấy xe" });

    res.json({ message: "Xóa xe thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
