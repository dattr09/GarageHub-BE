const express = require("express");
const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({ message: " 1111 pong from backend" });
});

module.exports = router;
