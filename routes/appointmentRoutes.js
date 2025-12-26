const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAppointmentsByPhone,
  cancelAppointment,
  getAvailableSlots,
} = require("../controllers/appointmentController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Public routes (không cần đăng nhập)
router.post("/", createAppointment); // Đặt lịch
router.get("/slots/available", getAvailableSlots); // Kiểm tra khung giờ khả dụng
router.get("/phone/:phone", getAppointmentsByPhone); // Tìm lịch theo số điện thoại
router.post("/:id/cancel", cancelAppointment); // Hủy lịch

// Protected routes (chỉ admin và employee)
router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin", "employee"]),
  getAllAppointments
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin", "employee"]),
  getAppointmentById
);

router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles(["admin", "employee"]),
  updateAppointmentStatus
);

module.exports = router;

