const e = require("express");
const Brand = require("../models/brandModel");
const Part = require("../models/partModel");
const { uploadToCloudinary, deleteFromCloudinary } = require("../services/cloudinary/upload");

// ✅ Lấy tất cả Brand
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thương hiệu:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand)
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Tạo Brand mới
exports.createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    // Kiểm tra trùng tên
    const existing = await Brand.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Thương hiệu đã tồn tại" });

    // Upload ảnh lên Cloudinary nếu có
    let imagePublicId = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "brand");
      imagePublicId = result.public_id;
    }

    const brand = new Brand({ name, image: imagePublicId });
    await brand.save();

    res.status(201).json({ message: "Tạo thương hiệu thành công", brand });
  } catch (err) {
    console.error("Lỗi khi tạo brand:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Cập nhật Brand
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const brand = await Brand.findById(id);
    if (!brand)
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

    // Nếu có ảnh mới, upload lên Cloudinary và xóa ảnh cũ
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (brand.image) {
        try {
          await deleteFromCloudinary(brand.image);
        } catch (err) {
          console.error("Lỗi khi xóa ảnh cũ:", err);
        }
      }
      // Upload ảnh mới
      const result = await uploadToCloudinary(req.file.buffer, "brand");
      brand.image = result.public_id;
    }

    // Cập nhật tên nếu có
    if (name) {
      brand.name = name;
    }

    await brand.save();

    res.json({ message: "Cập nhật thành công", brand });
  } catch (err) {
    console.error("Lỗi khi cập nhật brand:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Xóa Brand
exports.deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;

    // Kiểm tra xem có phụ tùng nào đang tham chiếu đến thương hiệu này không
    const partsUsingBrand = await Part.find({ brandId });
    if (partsUsingBrand.length > 0) {
      return res.status(400).json({
        message:
          "Không thể xóa thương hiệu vì có phụ tùng đang tham chiếu đến thương hiệu này.",
        parts: partsUsingBrand.map((part) => ({
          id: part._id,
          name: part.name,
        })),
      });
    }

    // Lấy thông tin brand trước khi xóa để xóa ảnh trên Cloudinary
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thương hiệu để xóa." });
    }

    // Xóa ảnh trên Cloudinary nếu có
    if (brand.image) {
      try {
        await deleteFromCloudinary(brand.image);
      } catch (err) {
        console.error("Lỗi khi xóa ảnh trên Cloudinary:", err);
      }
    }

    // Xóa thương hiệu
    await Brand.findByIdAndDelete(brandId);

    res.status(200).json({ message: "Thương hiệu đã được xóa thành công." });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi xóa thương hiệu.", error: error.message });
  }
};
