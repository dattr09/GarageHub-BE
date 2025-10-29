const express = require("express");
const router = express.Router();
const motosController = require("../controllers/motosController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// 📘 Lấy toàn bộ danh sách xe (Admin, Employee)
router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin", "employee"]),
  motosController.getAllMotos
);

// 🔍 Lấy xe theo biển số (Admin, Employee)
router.get(
  "/:licensePlate",
  authenticateToken,
  authorizeRoles(["admin", "employee"]),
  motosController.getByLicensePlate // ✅ Dùng controller có populate
);

// ➕ Thêm xe mới (Admin)
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  motosController.createMoto
);

// ✏️ Cập nhật thông tin xe (Admin, Employee)
router.put(
  "/:licensePlate",
  authenticateToken,
  authorizeRoles(["admin", "employee"]),
  async (req, res) => {
    const { licensePlate } = req.params;
    const updateData = req.body;

    try {
      const escaped = licensePlate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const moto = await Moto.findOneAndUpdate(
        { licensePlate: { $regex: `^${escaped}$`, $options: "i" } },
        updateData,
        { new: true }
      );

      if (!moto) {
        return res.status(404).json({ message: "Không tìm thấy xe máy" });
      }

      res.status(200).json({ message: "Cập nhật thành công", moto });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  }
);

// ❌ Xóa xe (Admin)
router.delete(
  "/:licensePlate",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    const { licensePlate } = req.params;

    try {
      const moto = await Moto.findOneAndDelete({ licensePlate });

      if (!moto) {
        return res.status(404).json({ message: "Không tìm thấy xe máy" });
      }

      res.status(200).json({ message: "Xóa xe thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  }
);

module.exports = router;
