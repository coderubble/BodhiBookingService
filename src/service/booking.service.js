const models = require("../models");
var CircularJSON = require('circular-json');
const axios = require("axios");
const moment = require("moment-timezone");
const sequelize = models.sequelize;
const Booking = models.booking;
const constants = require("../constants/constants");
const { Op } = require("sequelize");
const parser = require("cron-parser");
const { BOOKED, PENDING, BLOCKED, OPEN, CANCELLED } = constants.status;
const { CLINIC_ADMIN, CLINIC_USER, PATIENT } = constants.roles;
const scheduleList = require("../utils/schedule.util");

exports.createBooking = async function ({ patient_email_id, clinic_id, doctor_id, time_slot, status }, userInfo, callback) {
  const bookingData = { patient_email_id, clinic_id, doctor_id, time_slot, status };
  // console.log(`bookingData:${JSON.stringify(bookingData)}`);
  // var formattedDate = moment(time_slot, 'YYYY-MM-DD hh:mm:ss').toDate();
  // var utcFormat = moment.utc(formattedDate, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD HH:mm:ss+00');
  // console.log(`time:>>>>>>>>>>>>>>>>${utcFormat}`);
  try {
    if (userInfo.email_id === patient_email_id) {
      await Booking.update({ patient_email_id, status: BOOKED }, { where: { clinic_id, doctor_id, status: { [ Op.or ]: [ OPEN, CANCELLED ] }, time_slot } })
        .then(result => {
          // console.log(`result:${result}`);
          callback(null, { bookedStatus: result === 0 ? "Booking Failed" : "Booked Successfully" });
        }).catch(error => {
          console.log(`Error:${JSON.stringify(error.message)}`);
          throw error;
        });
    } else {
      throw ("Unauthorized to create Booking");
    }
  } catch (error) {
    console.log(`Service catch:${JSON.stringify(error)}`);
    callback(error);
  };
};

exports.insertSchedule = async function ({ clinic_id, doctor_id, load_date }, { schedule }, callback) {
  let transaction = null;
  try {
    let timeslots = [];
    timeslots = scheduleList(schedule, load_date);
    transaction = await sequelize.transaction();
    if (Array.isArray(timeslots) && timeslots.length) {
      let schedule;
      for (let index = 0; index < timeslots.length; index++) {
        schedule = await Booking.create({ patient_email_id: '', clinic_id, doctor_id, time_slot: timeslots[ index ], status: OPEN }, { transaction });
      }
      await transaction.commit();
      if (schedule) {
        callback(null, 'success');
      } else {
        console.log("Error while inserting Schedule details");
        throw "Error while inserting Schedule details";
      }
    } else {
      throw "Empty Array of Timeslots"
    }
  } catch (error) {
    await transaction.rollback();
    console.log(`Catch error:${JSON.stringify(error)}`);
    callback(error);
  }
};

exports.cancelBooking = async function ({ patient_email_id, clinic_id, doctor_id, time_slot, status }, userInfo, callback) {
  try {
    if (userInfo.user_type === PATIENT) {
      if (userInfo.email_id !== patient_email_id) throw ("Unauthorised to Cancel Booking");
    } else if ([ CLINIC_ADMIN, CLINIC_USER ].includes(userInfo.user_type)) {
      if (userInfo.clinic_id !== clinic_id) throw ("Unauthorised to Cancel Booking");
    } else {
      throw ("Unauthorised to Cancel Booking");
    }
    const bookedInfo = await Booking.findOne({ where: { patient_email_id, clinic_id, doctor_id, time_slot, status } });
    if (bookedInfo !== null) {
      await Booking.update({ status: CANCELLED }, { where: { patient_email_id, clinic_id, doctor_id, time_slot, status } })
        .then((result) => {
          callback(null, { message: `Cancelled Booking:${result}` });
        }).catch(error => {
          console.log(`Update Catch error::${JSON.stringify(error)}`);
          throw ("Error while updating");
        })
    }
    else {
      throw ("Booking not found");
    }
  } catch (error) {
    console.log(`Cancel Booking catch: ${JSON.stringify(error)} `);
    callback(error);
  }
};

exports.viewBooking = async function ({ from, to }, { given_date }, userInfo, callback) {
  const to_record = to || 50;
  const offset = from || 0;
  const limit = Math.min(25, to_record - offset);
  try {
    if ([ CLINIC_ADMIN, CLINIC_USER ].includes(userInfo.user_type)) {
      await Booking.findAll({
        limit, offset, where: {
          clinic_id: userInfo.clinic_id,
          andOp: sequelize.where(sequelize.fn('DATE', sequelize.col('time_slot')), given_date)
        }, order: [ [ 'time_slot', 'ASC' ] ]
      })
        .then((bookingDetails) => {
          callback(null, bookingDetails)
        }).catch(error => {
          console.log(`View Booking catch(Clinic): ${JSON.stringify(error)} `);
          callback(error);
        })
    } else if (userInfo.user_type === PATIENT) {
      await Booking.findAll({ limit, offset, where: { patient_email_id: userInfo.email_id } })
        .then((bookingDetails) => {
          callback(null, bookingDetails)
        }).catch(error => {
          console.log(`View Booking catch(Patient): ${JSON.stringify(error)} `);
          callback(error);
        })
    }
    else {
      throw ('Unauthorised to View Bookings');
    }
  } catch (error) {
    callback(error);
  }
}

exports.loadSchedule = async function ({ clinic_id, given_date }, callback) {
  //console.log(`given date:${given_date}`);
  let start = moment.tz(given_date, "Australia/Sydney");
  let end = moment(given_date).add(1, 'day');
  //console.log(`start:${start},end:${end}`);

  await Booking.findAll({
    attributes: [ 'doctor_id', 'time_slot' ],
    where: {
      clinic_id: clinic_id,
      time_slot: {
        [ Op.between ]: [ start, end ]
      },
      status: OPEN
    }, order: [ [ 'time_slot', 'ASC' ] ], raw: true
  })
    .then((schedule) => {
      let scheduleArray = schedule.map(data => {
        let t = data.time_slot;
        // let currentTimeSlot = moment.tz(t, "Australia/Sydney").format('YYYY_MM_DD HH:mm:ss');
        return { doctor_id: data.doctor_id, time_slot: data.time_slot };

        // let t = data.time_slot;
        // let currentTimeSlot = moment.tz(t, "Australia/Sydney").format('HH:mm');
        // return { doctor_id: data.doctor_id, time_slot: currentTimeSlot };
      })
      callback(null, scheduleArray);
    }).catch(error => {
      console.log(`View Schedule catch(Clinic): ${JSON.stringify(error.message)} `);
      callback(error);
    })
}

exports.viewMyBooking = async function ({ user_id }, callback) {
  try {
    const bookingDetails = await Booking.findAll({ attributes: [ 'id', 'patient_email_id', 'clinic_id', 'doctor_id', 'time_slot', 'status' ], where: { patient_email_id: user_id } });
    const bookingArray = await Promise.all(bookingDetails.map(async d => {
      result = await axios.get(`${process.env.CLINICSERVICE_URL}/clinic/readClinicName/${d.clinic_id}`);
      const doctor = await result.data.doctors.filter(doctor => doctor._id === d.doctor_id)[ 0 ];
      return { email_id: d.patient_email_id, clinic_name: result.data.name, doctor_name: `${doctor.first_name} ${doctor.last_name}`, time_slot: d.time_slot, status: d.status };
    }));
    callback(null, bookingArray);
  } catch (error) {
    console.log(`View Booking catch(Patient): ${JSON.stringify(error)} `);
    callback(error);
  }
};

