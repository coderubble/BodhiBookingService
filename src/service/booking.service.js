const Booking = require("../models/booking.model");
const { BOOKED, PENDING, BLOCKED, OPEN, CANCEL } = require("../constants/constants")

exports.createBooking = async function ({ patient_email_id, clinic_id, doctor_id, date, time, status }, callback) {
  const bookingData = { patient_email_id, clinic_id, doctor_id, date, time, status };
  // console.log(`BOOKING DETAILS:${JSON.stringify(bookingData)}`);
  try {
    const existingDetails = await Booking.findOne({ where: { doctor_id, time } });
    console.log(`Existing:${JSON.stringify(existingDetails)}`);
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
  } catch (error) {
    console.log(`Service catch:${JSON.stringify(error)}`);
    callback(error);
  };
};

exports.cancelBooking = async function ({ patient_email_id, clinic_id, doctor_id, date, time, status }, callback) {
  try {
    console.log("inside cancel service");
    const bookedInfo = await Booking.findOne({ where: { patient_email_id, clinic_id, doctor_id, date, time, status } });
    if (bookedInfo !== null) {
      console.log(`Booking details of patient:${patient_email_id}`);
      await Booking.update({ status: CANCEL }, { where: { patient_email_id, clinic_id, doctor_id, date, time, status } })
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
    console.log(`Cancel Booking catch: ${ JSON.stringify(error) } `);
    callback(error);
  }
};

