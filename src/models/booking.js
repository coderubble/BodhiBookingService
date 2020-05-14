'use strict';
const constants = require("../constants/constants");
const { BOOKED, PENDING, BLOCKED, OPEN, CANCELLED } = constants.status;
module.exports = (sequelize, DataTypes) => {
  const booking = sequelize.define('booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patient_email_id: { type: DataTypes.STRING, allowNull: false },
    clinic_id: { type: DataTypes.STRING, allowNull: false },
    doctor_id: { type: DataTypes.STRING, allowNull: false },
    time_slot: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM(BOOKED, PENDING, BLOCKED, OPEN, CANCELLED), allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false }
  }, {});
  booking.associate = function (models) {
  };
  return booking;
};