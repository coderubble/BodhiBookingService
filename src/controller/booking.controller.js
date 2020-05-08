const express = require("express");
const router = express.Router();
const { createBooking, cancelBooking } = require("../service/booking.service");

router.post("/", (req, res) => {
  createBooking(req.body, (error, result) => {
    if (result) {
      res.status(201).send(result);
    }
    else {
      res.status(403).send(error);
    }
  })
});


router.put("/", (req, res) => {
  console.log("Cancel Booking");
  cancelBooking(req.body, (error, result) => {
    if (result) {
      res.status(201).send(result);
    }
    else {
      res.status(403).send(error);
    }
  })
})

module.exports = router;