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
    if (!part) {
      return res.status(404).json({ message: "Không tìm thấy phụ tùng." });
    }
    res.status(200).json(part);
  } catch (error) {
    console.error("Error fetching part:", error);
    res.status(500).json({ message: "Lỗi khi lấy phụ tùng.", error: error.message });
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

// Lấy danh sách phụ tùng theo brandId
exports.getPartsByBrand = async (req, res) => {
  const { brandId } = req.params;

  try {
    // Tìm tất cả các phụ tùng có brandId khớp
    const parts = await Part.find({ brandId });
    res.status(200).json(parts);
  } catch (error) {
    console.error("Error fetching parts by brand:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách phụ tùng." });
  }
};

// Cập nhật số lượng phụ tùng
exports.updatePartQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const part = await Part.findById(id);
        if (!part) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại." });
        }

        part.quantity += quantity;
        await part.save();

        res.status(200).json({ message: "Cập nhật tồn kho thành công.", part });
    } catch (error) {
        console.error("Lỗi khi cập nhật tồn kho:", error);
        res.status(500).json({ message: "Cập nhật tồn kho thất bại.", error: error.message });
    }
};
