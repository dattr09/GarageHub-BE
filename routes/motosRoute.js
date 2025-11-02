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
  motosController.getByLicensePlate
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
  motosController.updateMoto // ✅ Gọi controller
);

// ❌ Xóa xe (Admin)
router.delete(
  "/:licensePlate",
  authenticateToken,
  authorizeRoles(["admin"]),
  motosController.deleteMoto // ✅ Gọi controller thay vì viết inline
);


module.exports = router;
