const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/auth");
const { createBooking, cancelBooking, viewBooking } = require("../service/booking.service");

router.post("/", auth, (req, res) => {
  getUserInfo(res, (error, result) => {
    if (result) {
      const userInfo = result.data;
      createBooking(req.body, userInfo, (error, result) => {
        if (result) {
          res.status(201).send(result);
        } else {
          res.status(403).send(error);
        }
      })
    } else {
      console.log(`Error::${error}`);
      res.status(403).send(error);
    }
  });
});

router.put("/", auth, (req, res) => {
  getUserInfo(res, (error, result) => {
    if (result) {
      console.log(`UserInfo:${JSON.stringify(result.data)}`);
      const userInfo = result.data;

      cancelBooking(req.body, userInfo, (error, result) => {
        if (result) {
          res.status(201).send(result);
        }
        else {
          res.status(403).send(error);
        }
      })
    } else {
      console.log(`Error::${error}`);
      res.status(403).send(error);
    }
  });
})
//View Bookings by Clinic Admin/Clinic User of their clinic on a particular date
router.get("/:date", (req, res) => {
  console.log(`View Booking: ${JSON.stringify(req.params.date)}`);
  getUserInfo(res, (error, result) => {
    if (result) {
      console.log(`UserInfo:${JSON.stringify(result.data)}`);
      const userInfo = result.data;
      viewBooking(req.query, req.params, userInfo, (error, result) => {
        if (result) {
          res.send(result);
        }
        else {
          res.status(400).send(error);
        }
      })
    } else {
      console.log(`Error::${error}`);
      res.status(403).send(error);
    }
  })
});

function getUserInfo(res, callback) {
  const token = res.getHeader("x-access-token");
  axios.get(`${process.env.USERSERVICE_URL}/user`, {
    headers: {
      "x-access-token": token,
      "authorization": token,
      "Content-Type": "application/json"
    }
  }).then((response) => {
    callback(null, response);
  }).catch((error) => {
    callback(error);
  })
}


module.exports = router;