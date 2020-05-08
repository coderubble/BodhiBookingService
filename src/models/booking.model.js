const { STRING, DATEONLY, ENUM } = require("sequelize");
const { sequelize } = require("../db/booking.db");
const { BOOKED, PENDING, BLOCKED, OPEN, CANCEL } = require("../constants/constants")

const Booking = sequelize().define('bookings', {
  patient_email_id: { type: STRING, allowNull: false },
  clinic_id: { type: STRING, allowNull: false },
  doctor_id: { type: STRING, allowNull: false },
  date: { type: DATEONLY, allowNull: false },
  time: { type: STRING, allowNull: false },
  status: { type: ENUM(BOOKED, PENDING, BLOCKED, OPEN, CANCEL), allowNull: false }
});
Booking.sync();

module.exports = Booking;