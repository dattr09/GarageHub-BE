const Part = require("../models/partModel");

// 📦 Lấy tất cả phụ tùng
exports.getAllParts = async (req, res) => {
  try {
    const parts = await Part.find().populate("brandId", "name"); // nếu Brand có trường name
    res.status(200).json(parts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách phụ tùng", error: err.message });
  }
};

// 🔍 Lấy phụ tùng theo ID
exports.getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id).populate("brandId", "name");
    if (!part)
      return res.status(404).json({ message: "Không tìm thấy phụ tùng" });
    res.status(200).json(part);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy phụ tùng", error: err.message });
  }
};

// ➕ Thêm phụ tùng mới
exports.createPart = async (req, res) => {
  try {
    const part = new Part(req.body);
    await part.save();
    res.status(201).json({ message: "Thêm phụ tùng thành công", part });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Thêm phụ tùng thất bại", error: err.message });
  }
};

// ✏️ Cập nhật phụ tùng
exports.updatePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!part)
      return res
        .status(404)
        .json({ message: "Không tìm thấy phụ tùng để cập nhật" });
    res.status(200).json({ message: "Cập nhật thành công", part });
  } catch (err) {
    res.status(400).json({ message: "Cập nhật thất bại", error: err.message });
  }
};

// 🗑️ Xóa phụ tùng
exports.deletePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part)
      return res
        .status(404)
        .json({ message: "Không tìm thấy phụ tùng để xóa" });
    res.status(200).json({ message: "Xóa phụ tùng thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa phụ tùng", error: err.message });
  }
};
