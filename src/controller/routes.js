const express = require("express");
const router = express.Router();
const booking = require("./booking.controller");
const misc = require("./health");
router.use("/booking", booking);
router.use("/", misc);

module.exports = router;