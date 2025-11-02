const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
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

// Public route
router.get("/", getAllParts);
router.get("/:id", getPartById);

// Các route yêu cầu đăng nhập & phân quyền (admin hoặc employee)
router.post("/", authenticateToken, authorizeRoles(["admin", "employee"]), createPart);
router.put("/:id", authenticateToken, authorizeRoles(["admin", "employee"]), updatePart);
router.delete("/:id", authenticateToken, authorizeRoles(["admin", "employee"]), deletePart);
router.get("/:brandId/parts", getPartsByBrand);
router.patch("/:id/quantity", authenticateToken, authorizeRoles(["admin", "employee"]), updatePartQuantity);

module.exports = router;
