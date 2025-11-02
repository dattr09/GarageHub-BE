const express = require("express");
const router = express.Router();
const {
  createRepairOrder,
  getRepairOrders,
  getRepairOrderById,
  updateRepairOrder,
} = require("../controllers/repairOrderController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Chỉ nhân viên/admin mới tạo phiếu
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin", "employee"]),
  createRepairOrder
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin", "employee"]),
  getRepairOrders
);

// Lấy phiếu theo id
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin", "employee"]),
  getRepairOrderById
);

// Sửa phiếu
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin", "employee"]),
  updateRepairOrder
);

module.exports = router;