const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  deletePart,
  getPartsByBrand,
  updatePartQuantity,
} = require("../controllers/partController");

const router = express.Router();

// Public route (nếu bạn muốn cho phép khách hàng xem danh sách phụ tùng)
router.get("/", getAllParts);
router.get("/:id", getPartById);

// Các route yêu cầu đăng nhập & phân quyền
router.post("/", authenticateToken, createPart);
router.put("/:id", authenticateToken, updatePart);
router.delete("/:id", authenticateToken, deletePart);
router.get("/:brandId/parts", getPartsByBrand);
router.patch("/:id/quantity", updatePartQuantity);

module.exports = router;
