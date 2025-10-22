const express = require("express");
const router = express.Router();
const motosController = require("../controllers/motosController");
const auth = require("../middleware/authMiddleware"); // ✅ import đúng middleware

// 📘 Lấy toàn bộ danh sách xe (Admin, Employee)
router.get("/", auth(["Admin", "Employee"]), motosController.getAllMotos);

// 🔍 Lấy xe theo biển số (Admin, Employee)
router.get(
  "/:licensePlate",
  auth(["admin", "employee"]),
  motosController.getByLicensePlate
);

// ➕ Thêm xe mới (Admin)
router.post("/", auth(["admin"]), motosController.createMoto);

// ✏️ Cập nhật thông tin xe (Admin, Employee)
router.put(
  "/:licensePlate",
  auth(["admin", "employee"]),
  motosController.updateMoto
);

// ❌ Xóa xe (Admin)
router.delete("/:licensePlate", auth(["Admin"]), motosController.deleteMoto);

module.exports = router;
