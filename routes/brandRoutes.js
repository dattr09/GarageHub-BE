const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const auth = require("../middleware/authMiddleware"); // ✅ import đúng tên

// Chỉ Admin mới được thêm brand
router.post("/", auth(["admin"]), brandController.createBrand);
router.put("/:id", auth(["admin"]), brandController.updateBrand);
router.delete("/:id", auth(["admin"]), brandController.deleteBrand);

// Ai cũng xem được brand
router.get("/", brandController.getAllBrands);

module.exports = router;
