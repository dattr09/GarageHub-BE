const Part = require("../models/partModel");
const { uploadToCloudinary, deleteFromCloudinary } = require("../services/cloudinary/upload");

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
    const partData = { ...req.body };

    // Upload ảnh lên Cloudinary nếu có
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "part");
      partData.image = result.public_id;
    }

    const part = new Part(partData);
    await part.save();
    res.status(201).json({ message: "Thêm phụ tùng thành công", part });
  } catch (err) {
    console.error("Lỗi khi tạo part:", err);
    res
      .status(400)
      .json({ message: "Thêm phụ tùng thất bại", error: err.message });
  }
};

// ✏️ Cập nhật phụ tùng
exports.updatePart = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part)
      return res
        .status(404)
        .json({ message: "Không tìm thấy phụ tùng để cập nhật" });

    // Nếu có ảnh mới, upload lên Cloudinary và xóa ảnh cũ
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (part.image) {
        try {
          await deleteFromCloudinary(part.image);
        } catch (err) {
          console.error("Lỗi khi xóa ảnh cũ:", err);
        }
      }
      // Upload ảnh mới
      const result = await uploadToCloudinary(req.file.buffer, "part");
      part.image = result.public_id;
    }

    // Cập nhật các trường khác
    Object.keys(req.body).forEach((key) => {
      if (key !== "image") {
        part[key] = req.body[key];
      }
    });

    await part.save();
    res.status(200).json({ message: "Cập nhật thành công", part });
  } catch (err) {
    console.error("Lỗi khi cập nhật part:", err);
    res.status(400).json({ message: "Cập nhật thất bại", error: err.message });
  }
};

// 🗑️ Xóa phụ tùng
exports.deletePart = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part)
      return res
        .status(404)
        .json({ message: "Không tìm thấy phụ tùng để xóa" });

    // Xóa ảnh trên Cloudinary nếu có
    if (part.image) {
      try {
        await deleteFromCloudinary(part.image);
      } catch (err) {
        console.error("Lỗi khi xóa ảnh trên Cloudinary:", err);
      }
    }

    await Part.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa phụ tùng thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa part:", err);
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
