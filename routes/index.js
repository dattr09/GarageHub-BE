const express = require("express");
const router = express.Router();
router.use("/auth", require("./auth"));
router.use("/motos", require("./motosRoute"));
router.use("/brands", require("./brandRoutes"));
module.exports = router;
