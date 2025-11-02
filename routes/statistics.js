const express = require("express");
const router = express.Router();
const { getStatistics } = require("../controllers/statisticsController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  getStatistics
);

module.exports = router;