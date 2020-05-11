const models = require("../models");
const Booking = models.booking;
const constants = require("../constants/constants");
const { BOOKED, PENDING, BLOCKED, OPEN, CANCELLED } = constants.status;
const { CLINIC_ADMIN, CLINIC_USER, PATIENT } =constants.roles;

exports.createBooking = async function ({ patient_email_id, clinic_id, doctor_id, date, time, status }, userInfo, callback) {
  const bookingData = { patient_email_id, clinic_id, doctor_id, date, time, status };
  console.log(`BOOKING DETAILS:${JSON.stringify(bookingData)}>>>>userInfo:${JSON.stringify(userInfo)}`);
  try {
    if (userInfo.email_id === patient_email_id) {
      const existingDetails = await Booking.findOne({ where: { doctor_id, time } });
      if (existingDetails !== null) {
        if (existingDetails.status === BOOKED) {
          throw ("Timeslot Already Booked");
        }
      } else {
        await Booking.create(bookingData).then(result => {
          console.log(`Result:${JSON.stringify(result)}`);
          callback(null, result);
        }).catch(error => {
          console.log(`Error:${JSON.stringify(error)}`);
          throw ("Error while creating Booking data");
        });
      }
    }
    else {
      throw ("Unauthorized to create Booking");
    }
  } catch (error) {
    console.log(`Service catch:${JSON.stringify(error)}`);
    callback(error);
  };
};

exports.cancelBooking = async function ({ patient_email_id, clinic_id, doctor_id, date, time, status }, userInfo, callback) {
  try {
    if (userInfo.user_type === PATIENT) {
      if (userInfo.email_id !== patient_email_id) throw ("Unauthorised to Cancel Booking");
    } else if ([CLINIC_ADMIN, CLINIC_USER].includes(userInfo.user_type)) {
      if (userInfo.clinic_id !== clinic_id) throw ("Unauthorised to Cancel Booking");
    } else {
      throw ("Unauthorised to Cancel Booking");
    }
    const bookedInfo = await Booking.findOne({ where: { patient_email_id, clinic_id, doctor_id, date, time, status } });
    if (bookedInfo !== null) {
      console.log(`Booking details of patient:${patient_email_id}`);
      await Booking.update({ status: CANCELLED }, { where: { patient_email_id, clinic_id, doctor_id, date, time, status } })
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

exports.viewBooking = async function ({ from, to }, { date },userInfo, callback) {
  const to_record = to || 1;
  const offset = from || 0;
  const limit = Math.min(25, to_record - offset);

  await Booking.findAndCountAll({ limit, offset, where: { date,clinic_id:userInfo.clinic_id } })
    .then((bookingDetails) => {
      callback(null, bookingDetails)
    }).catch(error => {
      console.log(`View Booking catch: ${JSON.stringify(error)} `);
      callback(error);
    })

}

