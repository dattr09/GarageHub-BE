const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/orders", require("./orderRoute"));
router.use("/reviews", require("./reviewRoute"));

module.exports = router;
