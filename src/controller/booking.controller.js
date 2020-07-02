const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/auth");
const { createBooking, cancelBooking, viewBooking, insertSchedule } = require("../service/booking.service");

router.post("/", auth, (req, res) => {
  getUserInfo(res, (error, result) => {
    if (result) {
      const userInfo = result.data;
      createBooking(req.body, userInfo, (error, result) => {
        if (result) {
          res.status(201).send("Success");
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
      const userInfo = result.data;
      cancelBooking(req.body, userInfo, (error, result) => {
        if (result) {
          res.status(201).send("Cancelled Booking");
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
router.get("/:given_date", auth, (req, res) => {
  getUserInfo(res, (error, result) => {
    if (result) {
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

router.post("/createSchedule/:clinic_id/:doctor_id/:load_date", (req, res) => {
  getSchedule(req.params, (error, result) => {
    if (result) {
      var result_string = JSON.stringify(result.data);
      insertSchedule(req.params, result.data, (error, result) => {
        if (result) {
          res.status(200).send(result);
        }
        else {
          res.status(400).send(error);
        }
      })
    } else {
      console.log(`Error:${error}`);

    }

  })
})

function getSchedule({ clinic_id, doctor_id }, callback) {
  axios.get(`${process.env.CLINICSERVICE_URL}/clinic/schedule/${clinic_id}/${doctor_id}`).then((response) => {
    callback(null, response);
  }).catch((error) => {
    callback(error);
  })
}

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