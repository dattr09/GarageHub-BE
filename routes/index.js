const express = require("express");
const router = express.Router();
router.use("/auth", require("./auth"));
router.use("/orders", require("./orderRoute"));
router.use("/motos", require("./motosRoute"));
router.use("/brands", require("./brandRoutes"));
router.use("/parts", require("./partRoute"));
router.use("/repair-orders", require("./repairOrderRoutes"));
router.use("/statistics", require("./statistics"));
router.use("/chat", require("./chatRoutes"));
router.use("/gemini", require("./gemini"));
router.use("/appointments", require("./appointmentRoutes"));

module.exports = router;
