const express = require("express");
const router = express.Router();
const { createRepairOrder } = require("../controllers/repairOrderController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Chỉ nhân viên/admin mới tạo phiếu
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  createRepairOrder
);

// Xem phiếu của khách hàng
// router.get(
//   "/user/:customerId",
//   authenticateToken,
//   authorizeRoles(["admin"]),
//   repairOrderController.getByUser
// );

module.exports = router;
