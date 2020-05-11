'use strict';
const { BOOKED, PENDING, BLOCKED, OPEN, CANCELLED } = require("../constants/constants");
module.exports = (sequelize, DataTypes) => {
  const booking = sequelize.define('booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patient_email_id: { type: DataTypes.STRING, allowNull: false },
    clinic_id: { type: DataTypes.STRING, allowNull: false },
    doctor_id: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM(BOOKED, PENDING, BLOCKED, OPEN, CANCELLED), allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false }
  }, {});
  booking.associate = function (models) {
  };
  return booking;
};