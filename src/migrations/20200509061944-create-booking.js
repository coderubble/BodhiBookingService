'use strict';
const constants = require("../constants/constants");
const { BOOKED, PENDING, BLOCKED, OPEN, CANCEL } = constants.status;
module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('bookings', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      patient_email_id: { type: DataTypes.STRING, allowNull: false },
      clinic_id: { type: DataTypes.STRING, allowNull: false },
      doctor_id: { type: DataTypes.STRING, allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      time: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.ENUM(BOOKED, PENDING, BLOCKED, OPEN, CANCEL), allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('bookings');
  }
};