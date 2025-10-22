const Brand = require("../models/brandModel");

// ✅ Lấy tất cả Brand
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Tạo Brand mới
exports.createBrand = async (req, res) => {
  try {
    const { name, image } = req.body;

    // Kiểm tra trùng tên
    const existing = await Brand.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Thương hiệu đã tồn tại" });

    const brand = new Brand({ name, image });
    await brand.save();

    res.status(201).json({ message: "Tạo thương hiệu thành công", brand });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Cập nhật Brand
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    const brand = await Brand.findByIdAndUpdate(
      id,
      { name, image },
      { new: true }
    );

    if (!brand)
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

    res.json({ message: "Cập nhật thành công", brand });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Xóa Brand
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByIdAndDelete(id);

    if (!brand)
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

    res.json({ message: "Xóa thương hiệu thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
