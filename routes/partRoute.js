const express = require("express");
const router = express.Router();
const partController = require("../controllers/partController");
// Public route (nếu bạn muốn cho phép khách hàng xem danh sách phụ tùng)
router.get("/", partController.getAllParts);
router.get("/:id", partController.getPartById);

// Các route yêu cầu đăng nhập & phân quyền
router.post("/", partController.createPart);
router.put("/:id", partController.updatePart);
router.delete("/:id", partController.deletePart);

module.exports = router;
//   try {
