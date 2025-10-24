const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Chỉ Admin mới được thêm brand
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  brandController.createBrand
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  brandController.updateBrand
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  brandController.deleteBrand
);

// Ai cũng xem được brand
router.get("/", brandController.getAllBrands);

router.get("/:id", brandController.getBrandById);

module.exports = router;
