const express = require("express");
const router = express.Router();
router.use("/auth", require("./auth"));
router.use("/motos", require("./motosRoute"));
router.use("/brands", require("./brandRoutes"));
router.use("/parts", require("./partRoute"));
module.exports = router;
