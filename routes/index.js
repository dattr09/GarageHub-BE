const express = require("express");
const router = express.Router();
router.use("/auth", require("./auth"));
router.use("/orders", require("./orderRoute"));
router.use("/motos", require("./motosRoute"));
router.use("/brands", require("./brandRoutes"));
router.use("/parts", require("./partRoute"));
router.use("/repair-orders", require("./repairOrderRoutes"));
router.use("/chat", require("./chatRoutes"));

module.exports = router;
